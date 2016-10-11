import * as Rx from 'rxjs/Rx';

export class DDPClient {
  private static _instance: DDPClient = new DDPClient(); // Singleton

  public subject: Rx.Subject<DDPMessage>;
  public keyValueStore: KeyValueStore;

  private __ddpVersion = "1";
  private __supportedDDPVersions = ["1", "pre2", "pre1"];
  private __callStack: Array<any> = [];

  private __instantiated: boolean = false;
  private __connected: boolean = false;

  private __sendMessage: Function = () => {};

  static getInstance(): DDPClient {
    return DDPClient._instance;
  }

  constructor() {
    let observable = Rx.Observable.create((obs: Rx.Observer<DDPMessage>) => {});
    let observer = {
      next: ( message: DDPMessage) => {
        if(this.__connected) {
          this.__sendMessage(message);
        } else {
          this.__callStack.push(message);
        }
      }
    };
    this.subject = Rx.Subject.create(observer, observable);
  }

  onConnect() {
    this.__connected = true;
  }

  onMessageReceived(message) {
    this.subject.next(message);
  }

  onError(error) {
    this.subject.error(error);
  }

  onClose(){
    this.subject.complete();
  }

  onMessageSend(callback: Function) {
    this.__sendMessage = callback;
  }
}
