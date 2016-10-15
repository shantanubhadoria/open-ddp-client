import { IDDPClient, IDDPMessage, IKeyValueStore, MessageSendStatus } from "./models";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
export declare class DDPClient implements IDDPClient {
    static instance: DDPClient;
    keyValueStore: IKeyValueStore;
    sendMessageCallback: Function;
    subscription: Subject<string>;
    ddpSubscription: Observable<IDDPMessage>;
    connectedSubscription: Observable<IDDPMessage>;
    pingSubscription: Observable<IDDPMessage>;
    socketConnectedStatus: boolean;
    DDPConnectedStatus: boolean;
    reauthAttemptedStatus: boolean;
    private ddpVersion;
    private supportedDDPVersions;
    private callStack;
    constructor();
    connected(): void;
    connectedDDP(): void;
    dispatchCallStack(): void;
    send(msgObj: IDDPMessage): MessageSendStatus;
    private pong(msgObj);
}
