import { IDDPClient } from "../ddp-client/models";
import { IDDPDocument, IDDPMessageDocument, IDDPMessageDocumentAdded, IDDPMessageDocumentChanged, IDDPMessageDocumentRemoved } from "./models";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
export declare class Collection {
    collection: ReplaySubject<IDDPDocument[]>;
    documentSubscription: Observable<IDDPMessageDocument>;
    addedDocumentSubscription: Observable<IDDPMessageDocumentAdded>;
    changedDocumentSubscription: Observable<IDDPMessageDocumentChanged>;
    removedDocumentSubscription: Observable<IDDPMessageDocumentRemoved>;
    ddpClient: IDDPClient;
    private name;
    private store;
    constructor(name: string, ddpClient?: IDDPClient);
    private handleAdded(msgObj);
    private handleChanged(msgObj);
    private handleRemoved(msgObj);
    private getCollectionAsArray();
}
