import { IDDPMessage, IKeyValueStore } from "./models";
import * as Rx from "rxjs/Rx";
export declare class DDPClient {
    static Instance(): DDPClient;
    private static instance;
    subject: Rx.Subject<IDDPMessage>;
    keyValueStore: IKeyValueStore;
    private ddpVersion;
    private supportedDDPVersions;
    private callStack;
    private instantiated;
    private connected;
    private sendMessageCallbacks;
    constructor();
    onConnect(): void;
    onMessageReceived(message: string): void;
    onError(error: Error): void;
    onClose(): void;
    onMessageSend(callback: Function): void;
}
