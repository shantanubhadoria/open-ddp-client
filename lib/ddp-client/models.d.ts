/// <reference types="chai" />
import * as Rx from "rxjs/Rx";
export interface IKeyValueStore {
    get(key: string): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
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
export interface IDDPErrorObject {
    error: string;
    reason?: string;
    details?: string;
}
export interface IDDPClient {
    subject: Rx.Subject<IDDPMessage>;
    observer: IDDPObserver<IDDPMessage>;
    keyValueStore: IKeyValueStore;
    sendMessageCallback: Function;
    messageReceivedCallback: Function;
    errorCallback: Function;
    closeCallback: Function;
    onConnect(): void;
}
export interface IDDPObserver<T> {
    next(message: T): void;
}
