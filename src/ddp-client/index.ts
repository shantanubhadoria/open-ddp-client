import { IDDPMessage, IKeyValueStore } from "./models";
import * as EJSON from "ejson";

import * as Rx from "rxjs/Rx";

export class DDPClient {
  public static Instance(): DDPClient {
    return DDPClient.instance;
  }

  private static instance: DDPClient = new DDPClient(); // Singleton

  public subject: Rx.Subject<IDDPMessage>;
  public keyValueStore: IKeyValueStore;

  private ddpVersion = "1";
  private supportedDDPVersions = ["1", "pre2", "pre1"];
  private callStack: Array<IDDPMessage> = [];

  private connected: boolean = false;

  private sendMessageCallback: Function;
  private messageReceivedCallback: Function;
  private errorCallback: Function;
  private closeCallback: Function;

  constructor() {
    let observable = Rx.Observable.create((obs: Rx.Observer<IDDPMessage>) => {
      this.messageReceivedCallback = obs.next.bind(obs);
    });
    let observer = {
      next: (message: IDDPMessage) => {
          if (this.connected) {
            this.sendMessageCallback(EJSON.stringify(message));
          } else {
            this.callStack.push(message);
          }
      },
    };
    this.subject = Rx.Subject.create(observer, observable);
  }

  public onConnect() {
    this.connected = true;
    this.sendConnectMessage();
    this.resumeLoginWithToken();
    this.dispatchBufferedCallStack();
  }

  public onMessageReceived(message: string) {
    this.subject.next(EJSON.parse(message));
  }

  public onError(error: Error) {
    this.subject.error(error);
  }

  public onClose() {
    this.connected = false;
    this.subject.complete();
  }

  public onMessageSend(callback: Function) {
    this.sendMessageCallback = callback;
  }

  private sendConnectMessage() {
    let connectRequest: IDDPMessage = {
      msg: "connect",
      support: this.supportedDDPVersions,
      version: this.ddpVersion,
    };
    let sessionId = this.keyValueStore.get("DDPSessionId");
    if (sessionId) {
      connectRequest.session = sessionId;
    }
    this.subject.next(connectRequest);
  }

  private resumeLoginWithToken() {
    let loginToken = this.keyValueStore.get("LoginToken");
    if (loginToken) {
      // Accounts.loginWithToken(loginToken);
    }
  }

  private dispatchBufferedCallStack() {
    this.callStack.forEach((message: IDDPMessage) => {
      this.sendMessageCallback(EJSON.stringify(message));
    });
    this.callStack = [];
  }
}
