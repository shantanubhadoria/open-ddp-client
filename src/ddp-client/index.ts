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

  public sendMessageCallback: Function;
  public messageReceivedCallback: Function;
  public errorCallback: Function;
  public closeCallback: Function;

  private ddpVersion = "1";
  private supportedDDPVersions = ["1", "pre2", "pre1"];
  private callStack: Array<IDDPMessage> = [];

  private connected: boolean = false;
  private connectedDDP: boolean = false;
  private reauthAttempted: boolean = false;

  constructor() {
    let observable = Rx.Observable.create((obs: Rx.Observer<IDDPMessage>) => {
      this.messageReceivedCallback = (message: string) => {
        obs.next(EJSON.parse(message));
      };
      this.errorCallback = obs.error.bind(obs);
      this.closeCallback = obs.complete.bind(obs);
    });
    let observer = {
      next: (message: IDDPMessage) => {
          if (
            this.reauthAttempted
            || this.connectedDDP && message.msg === "login"
            || this.connected && message.msg === "connect"
          ) {
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

    this.subject
    .filter((message: IDDPMessage) => message.msg === "connected")
    .subscribe((connectedMessage: IDDPMessage) => {
      this.connectedDDP = true;
      this.keyValueStore.set("DDPSessionId", connectedMessage.session);
      this.resumeLoginWithToken(() => {
        this.reauthAttempted = true;
        this.dispatchBufferedCallStack();
      });
    });
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

  private resumeLoginWithToken(callback: Function) {
    let loginToken = this.keyValueStore.get("LoginToken");
    if (loginToken) {
      // Accounts.loginWithToken(loginToken, callback);
    } else {
      callback();
    }
  }

  private dispatchBufferedCallStack() {
    this.callStack.forEach((message: IDDPMessage) => {
      this.sendMessageCallback(EJSON.stringify(message));
    });
    this.callStack = [];
  }
}
