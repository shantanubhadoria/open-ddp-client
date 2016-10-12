import { IDDPMessage, IKeyValueStore } from "./models";

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
  private callStack: Array<any> = [];

  private instantiated: boolean = false;
  private connected: boolean = false;

  private sendMessageCallbacks: Array<Function> = [];

  constructor() {
    let observable = Rx.Observable.create();
    let observer = {
      next: (message: IDDPMessage) => {
          if (this.connected) {
            this.sendMessageCallbacks.forEach((callback) => {
              callback(message);
            });
          } else {
            this.callStack.push(message);
          }
      },
    };
    this.subject = Rx.Subject.create(observer, observable);
  }

  public onConnect() {
    this.connected = true;
  }

  public onMessageReceived(message: string) {
    this.subject.next(message);
  }

  public onError(error: Error) {
    this.subject.error(error);
  }

  public onClose() {
    this.subject.complete();
  }

  public onMessageSend(callback: Function) {
    this.sendMessageCallbacks.push(callback);
  }
}
