import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export interface IKeyValueStore {
  get(key: string): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
}

enum DDPMessageType {
  "connect",
  "message"
}

export enum MessageSendStatus {
  "sent",
  "deferred",
  "failed"
}

export interface IDDPMessage {
  msg?: string;
  id?: string; // for subscriptions and methods

  version?: string;
  support?: string[];
  session?: string;

  // For methods
  method?: string;
  params?: Array<any>; // for methods and subscriptions
  result?: Object;

  // For collections
  collection?: string;

  error?: IDDPErrorObject;
}

export interface IDDPMessageConnect {
  msg: string;
  session?: string;
  support: string[];
  version: string;
}

export interface IDDPErrorObject {
  error: string;
  reason?: string;
  details?: string;
}

export interface IDDPClient {
    subscription: Subject<string>;
    ddpSubscription: Observable<IDDPMessage>;
    keyValueStore: IKeyValueStore;
    send: Function;
    sendMessageCallback: Function;
}
