import { IDDPClient, IDDPErrorObject, IDDPMessage, IDDPObserver, IKeyValueStore } from "./models";
import * as Rx from "rxjs/Rx";
export default class DDPClient implements IDDPClient {
    static Instance(): DDPClient;
    private static instance;
    subject: Rx.Subject<IDDPMessage>;
    observer: IDDPObserver<IDDPMessage>;
    keyValueStore: IKeyValueStore;
    sendMessageCallback: Function;
    private ddpVersion;
    private supportedDDPVersions;
    private callStack;
    private connected;
    private connectedDDP;
    private reauthAttempted;
    constructor();
    onConnect(): void;
    messageReceivedCallback(message: string): void;
    errorCallback(error: IDDPErrorObject): void;
    closeCallback(): void;
    private sendConnectMessage();
    private resumeLoginWithToken(callback);
    private dispatchBufferedCallStack();
}
