import DDPClient from "../ddp-client";
import { IDDPClient, IDDPMessage } from "../ddp-client/models";
import ObjectId from "../object-id";
import { IDDPMessageMethodCall, IDDPMessageMethodResult, IDDPMessageMethodUpdated, IMethodCallStore } from "./models";

export default class Methods {
  public static Instance(): Methods {
    return Methods.instance;
  }

  private static instance: Methods = new Methods(); // Singleton

  private ddpClient: IDDPClient;
  private resultCallbacks: Map<string, IMethodCallStore> = new Map<string, IMethodCallStore>();
  private updatedCallbacks: Map<string, IMethodCallStore> = new Map<string, IMethodCallStore>();

  constructor(ddpClient: IDDPClient = DDPClient.Instance()) {
    if (ddpClient) {
      this.ddpClient = ddpClient;
    } else {
      this.ddpClient = DDPClient.Instance();
    }

    // Dispatch to result handler
    this.ddpClient.subject.filter((value: IDDPMessage) => value.msg === "result")
    .subscribe(this.handleResult.bind(this));

    // Dispatch to updated handler
    this.ddpClient.subject.filter((value: IDDPMessage) => value.msg === "updated")
    .subscribe(this.handleUpdated.bind(this));
  }

  public call(
    method: string,
    params?: Array<any>,
    resultCallback?: Function,
    updatedCallback?: Function
  ) {
    console.log(method);
    let methodId = new ObjectId();

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
    this.ddpClient.observer.next(methodCallMessage);

    return methodId.toHexString();
  }

  private handleResult(message: IDDPMessageMethodResult) {
    let methodCall: IMethodCallStore = this.resultCallbacks.get(message.id);
    methodCall.resultCallback(message.result, message.error);
    this.resultCallbacks.delete(message.id);
  }

  private handleUpdated(message: IDDPMessageMethodUpdated) {
    message.methods.forEach(methodId => {
      let methodCall: IMethodCallStore = this.updatedCallbacks.get(methodId);
      methodCall.updatedCallback({
        id: methodCall.id,
        method: methodCall.method,
        params: methodCall.params,
      });
      this.updatedCallbacks.delete(methodId);
    });
  }
}
