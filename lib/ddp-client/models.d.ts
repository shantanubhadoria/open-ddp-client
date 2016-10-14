/// <reference types="chai" />
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
export interface IKeyValueStore {
    get(key: string): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
}
export declare enum MessageSendStatus {
    "sent" = 0,
    "deferred" = 1,
    "failed" = 2,
}
export interface IDDPMessage {
    msg?: string;
    id?: string;
    version?: string;
    support?: string[];
    session?: string;
    method?: string;
    params?: Array<any>;
    result?: Object;
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
