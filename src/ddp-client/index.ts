import { IDDPClient, IDDPErrorObject, IDDPMessage, IDDPObserver, IKeyValueStore } from "./models";
import * as EJSON from "ejson";
import * as Rx from "rxjs/Rx";

export default class DDPClient implements IDDPClient {
  public static Instance(): DDPClient {
    return DDPClient.instance;
  }

  private static instance: DDPClient = new DDPClient(); // Singleton

  public subject: Rx.Subject<IDDPMessage>;
  public observer: IDDPObserver<IDDPMessage>;
  public keyValueStore: IKeyValueStore;

  public sendMessageCallback: Function;

  private ddpVersion = "1";
  private supportedDDPVersions = ["1", "pre2", "pre1"];
  private callStack: Array<IDDPMessage> = [];

  private connected: boolean = false;
  private connectedDDP: boolean = false;
  private reauthAttempted: boolean = false;

  constructor() {
    this.subject = new Rx.Subject();

    this.observer = {
      next: (msgObj: IDDPMessage) => {
          if (
            this.reauthAttempted
            || this.connectedDDP && msgObj.msg === "login"
            || this.connected && msgObj.msg === "connect"
          ) {
            this.sendMessageCallback(EJSON.stringify(msgObj));
          } else {
            this.callStack.push(msgObj);
          }
      },
    };

    // Trigger on connected message callbacks
    this.subject
    .filter((msgObj: IDDPMessage) => msgObj.msg === "connected")
    .subscribe((msgObj: IDDPMessage) => {
      this.connectedDDP = true;
      this.keyValueStore.set("DDPSessionId", msgObj.session);
      this.resumeLoginWithToken(() => {
        this.reauthAttempted = true;
        this.dispatchBufferedCallStack();
      });
    });
  }

  public onConnect() {
    this.connected = true;
    this.sendConnectMessage();
  }

  public messageReceivedCallback(message: string): void {
    this.subject.next(EJSON.parse(message));
  }

  public errorCallback(error: IDDPErrorObject) {
    this.subject.error(error);
  }

  public closeCallback() {
    this.subject.complete();
  }

  private sendConnectMessage() {
    let connectRequest: IDDPMessage = {
      msg: "connect",
      support: this.supportedDDPVersions,
      version: this.ddpVersion,
    };
    if (this.keyValueStore.has("DDPSessionId")) {
      connectRequest.session = this.keyValueStore.get("DDPSessionId");
    }
    this.observer.next(connectRequest);
  }

  private resumeLoginWithToken(callback: Function) {
    let loginToken = this.keyValueStore.get("LoginToken");
    if (loginToken) {
      // Accounts.loginWithToken(loginToken, callback);
      callback();
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
