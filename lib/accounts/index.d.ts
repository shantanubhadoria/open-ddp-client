import { IDDPClient } from "../ddp-client/models";
import { Methods } from "../methods";
export declare class Accounts {
    static instance: Accounts;
    ddpClient: IDDPClient;
    methodsObject: Methods;
    constructor(ddpClient?: IDDPClient, methodsObject?: Methods);
    login(params: any[], resultCallback?: Function, updatedCallback?: Function, methodName?: string): string;
    loginWithToken(token: string, resultCallback?: Function, updatedCallback?: Function): string;
    loginWithPassword(selector: string, password: string, resultCallback?: Function, updatedCallback?: Function): string;
    requestPhoneVerification(phone: string, resultCallback?: Function, updatedCallback?: Function): string;
    verifyPhone(phone: string, token: string, resultCallback?: Function, updatedCallback?: Function): void;
    private hashPassword(password);
}
