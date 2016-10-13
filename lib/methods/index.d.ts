import { IDDPClient } from "../ddp-client/models";
export default class Methods {
    static Instance(): Methods;
    private static instance;
    private ddpClient;
    private resultCallbacks;
    private updatedCallbacks;
    constructor(ddpClient?: IDDPClient);
    call(method: string, params?: Array<any>, resultCallback?: Function, updatedCallback?: Function): string;
    private handleResult(message);
    private handleUpdated(message);
}
