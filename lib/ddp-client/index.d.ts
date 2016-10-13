import { IDDPMessage, IKeyValueStore } from "./models";
import * as Rx from "rxjs/Rx";
export declare class DDPClient {
    static Instance(): DDPClient;
    private static instance;
    subject: Rx.Subject<IDDPMessage>;
    keyValueStore: IKeyValueStore;
    sendMessageCallback: Function;
    messageReceivedCallback: Function;
    errorCallback: Function;
    closeCallback: Function;
    private ddpVersion;
    private supportedDDPVersions;
    private callStack;
    private connected;
    private connectedDDP;
    private reauthAttempted;
    constructor();
    onConnect(): void;
    private sendConnectMessage();
    private resumeLoginWithToken(callback);
    private dispatchBufferedCallStack();
}
