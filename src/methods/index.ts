import { DDPClient } from "../ddp-client";
import { IDDPClient, IDDPMessage } from "../ddp-client/models";
import { ObjectId } from "../object-id";
import {
  IDDPMessageMethodCall,
  IDDPMessageMethodResult,
  IDDPMessageMethodUpdated,
  IMethodCallStore,
} from "./models";
import { Observable } from "rxjs/Observable";

export class Methods {
  public static instance: Methods = new Methods(); // Singleton

  public resultMessageSubscription: Observable<IDDPMessageMethodResult>;
  public updatedMessageSubscription: Observable<IDDPMessageMethodUpdated>;

  public ddpClient: IDDPClient;
  private resultCallbacks: Map<string, IMethodCallStore> = new Map<string, IMethodCallStore>();
  private updatedCallbacks: Map<string, IMethodCallStore> = new Map<string, IMethodCallStore>();

  constructor(ddpClient?: IDDPClient) {
    // This bit of code allows us to mock DDPClient with a alternate class or a localized instance of DDPClient
    if (ddpClient) {
      this.ddpClient = ddpClient;
    } else {
      this.ddpClient = DDPClient.instance;
    }

    this.resultMessageSubscription = this.ddpClient.ddpSubscription.filter(
      (msgObj: IDDPMessage) => {
        return msgObj.msg === "result";
      }
    );
    this.updatedMessageSubscription = this.ddpClient.ddpSubscription.filter(
      (msgObj: IDDPMessage) => {
        return msgObj.msg === "updated";
      }
    );

    // Dispatch subscriptions to result handlers
    this.resultMessageSubscription.subscribe(this.handleResult.bind(this));
    this.updatedMessageSubscription.subscribe(this.handleUpdated.bind(this));
  }

  public call(
    method: string,
    params?: any[],
    resultCallback?: Function,
    updatedCallback?: Function
  ): string {
    let methodId: ObjectId = new ObjectId();
    let methodIdStr: string = methodId.toHexString();
    let methodCallMessage: IDDPMessageMethodCall = {
      id: methodId.toHexString(),
      method,
      msg: "method",
      params,
    };

    if (resultCallback) {
      this.resultCallbacks.set(methodId.toHexString(), {
        id: methodId.toHexString(),
        method,
        params,
        resultCallback,
      });
    }

    if (updatedCallback) {
      this.updatedCallbacks.set(methodId.toHexString(), {
        id: methodId.toHexString(),
        method,
        params,
        updatedCallback,
      });
    }

    this.ddpClient.send(methodCallMessage);
    return methodIdStr;
  }

  public handleResult(msgObj: IDDPMessageMethodResult) {
    let methodStoreItem = this.resultCallbacks.get(msgObj.id);
    methodStoreItem.resultCallback(msgObj.result, msgObj.error);
    this.resultCallbacks.delete(msgObj.id);
  }

  public handleUpdated(msgObj: IDDPMessageMethodUpdated) {
    msgObj.methods.forEach(methodId => {
      let methodStoreItem = this.updatedCallbacks.get(methodId);
      methodStoreItem.updatedCallback();
      this.updatedCallbacks.delete(methodId);
    });
  }
}
