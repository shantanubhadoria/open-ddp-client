import { Accounts } from "../accounts";

import {
  IDDPClient,
  IDDPMessage,
  IDDPMessageConnect,
  IKeyValueStore,
  MessageSendStatus,
} from "./models";

import * as EJSON from "ejson";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export class DDPClient implements IDDPClient {
  public static instance: DDPClient = new DDPClient(); // Singleton

  // Setup pre-requisites
  public keyValueStore: IKeyValueStore;
  public sendMessageCallback: Function;

  /**
   * subscription for strings messages received by the client from the server.
   */
  public subscription: Subject<string> = new Subject<string>();

  /**
   * subscription for DDP message objects received by the client from the server
   */
  public ddpSubscription: Observable<IDDPMessage> = new Observable<IDDPMessage>();

  /**
   * subscription for connected messages received from server.
   */
  public connectedSubscription: Observable<IDDPMessage>;
  public pingSubscription: Observable<IDDPMessage>;
  /**
   * userId subject 
   * The userId() method checks if reauth is completed.
   * If reauth is completed:
   * * create a temporary observable, send userId to it, close the observable.
   * If reauth is not completed. 
   * * Return this observable. reAuthenticate() will send userId to this 
   * subroutine when it resolves and close this observable.  
   */
  public preReAuthUserIdSubject: Subject<string> = new Subject<string>();

  // Flags
  public socketConnectedStatus: boolean = false;
  public DDPConnectedStatus: boolean = false;
  public reauthAttemptedStatus: boolean = false;

  private ddpVersion = "1";
  private supportedDDPVersions = ["1", "pre2", "pre1"];
  private callStack: Array<IDDPMessage> = [];

  constructor() {
    this.sendMessageCallback = () => { return true; };

    // Create observables for DDP
    this.ddpSubscription = this.subscription.map(value => EJSON.parse(value));
    this.connectedSubscription = this.ddpSubscription.filter(
      (msgObj: IDDPMessage) => msgObj.msg === "connected"
    );
    this.pingSubscription = this.ddpSubscription.filter(
      (msgObj: IDDPMessage) => msgObj.msg === "ping"
    );

    // Dispatch observable subscriptions to their handlers
    this.connectedSubscription.subscribe((msgObj) => {
      this.DDPConnectedStatus = true;
      this.keyValueStore.set("DDPSessionId", msgObj.session);
      this.connectedDDP();
    });
    this.pingSubscription.subscribe(this.pong.bind(this));
  }

  /**
   * Trigger this method when your websocket connection is fully established on first conenction or on a reconnect 
   * after a disconnection.
   * 
   * Calling this method tells DDP client to start initialization communication with the DDP server. It makes the 
   * following communications:
   * 
   * * Send {msg: "connected" ... } to server
   * * Listener created by the constructor will take care of responding to the connected message received from the 
   * server subsequently.
   * 
   * Once this routine finishes its proceedures, all the buffered calls will be forwarded and any new calls will be 
   * immediately sent to the server instead of getting buffered.
   */
  public connected(): void {
    this.socketConnectedStatus = true;
    let connectRequest: IDDPMessageConnect = {
      msg: "connect",
      support: this.supportedDDPVersions,
      version: this.ddpVersion,
    };
    if (this.keyValueStore.has("DDPSessionId")) {
      connectRequest.session = this.keyValueStore.get("DDPSessionId");
    }
    this.sendMessageCallback(EJSON.stringify(connectRequest));
  }

  /**
   * This method is triggered when DDPClient receives a {msg: "connected"} message from the server. At this point the
   * client must attempt a reauthentication with a login token if one is found stored in the keyValueStore of the DDP 
   * client
   */
  public connectedDDP(): void {
    this.reAuthenticate(() => {
      this.dispatchCallStack();
    });
  }

  public dispatchCallStack(): void {
    this.callStack.forEach(msgObj => {
      this.send(msgObj);
    });
  }

  public send(msgObj: IDDPMessage): MessageSendStatus {
    if (
      (this.socketConnectedStatus && msgObj.msg === "connect")
      || (this.DDPConnectedStatus && msgObj.msg === "method" && msgObj.method === "login")
      || this.reauthAttemptedStatus
    ) {
      this.sendMessageCallback(EJSON.stringify(msgObj));
      return MessageSendStatus.sent;
    } else {
      this.callStack.push(msgObj);
      return MessageSendStatus.deferred;
    }
  }

  public userId(): Subject<string> {
    if (this.reauthAttemptedStatus) {
      let subject = new Subject<string>();
      subject.next(Accounts.instance.userId);
      subject.complete();
    } else {
      return this.preReAuthUserIdSubject;
    }
  }

  private reAuthenticate(callback: Function) {
    if (this.keyValueStore.has("loginToken")) {
      Accounts.instance.loginWithToken(this.keyValueStore.get("loginToken"), () => {
        this.preReAuthUserIdSubject.next(Accounts.instance.userId);
        this.preReAuthUserIdSubject.complete();
        this.reauthAttemptedStatus = true;
        callback();
      });
    } else {
      this.reauthAttemptedStatus = true;
      callback();
    }
  }

  private pong(msgObj: IDDPMessage) {
    this.send({msg: "pong"});
  }
}
