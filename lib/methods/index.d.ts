import { IDDPClient } from "../ddp-client/models";
import { IDDPMessageMethodResult, IDDPMessageMethodUpdated } from "./models";
import { Observable } from "rxjs/Observable";
export declare class Methods {
    static instance: Methods;
    resultMessageSubscription: Observable<IDDPMessageMethodResult>;
    updatedMessageSubscription: Observable<IDDPMessageMethodUpdated>;
    private ddpClient;
    private resultCallbacks;
    private updatedCallbacks;
    constructor(ddpClient?: IDDPClient);
    call(method: string, params?: any[], resultCallback?: Function, updatedCallback?: Function): string;
    handleResult(msgObj: IDDPMessageMethodResult): void;
    handleUpdated(msgObj: IDDPMessageMethodUpdated): void;
}
