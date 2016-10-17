import { DDPClient } from "../ddp-client";
import { IDDPClient  } from "../ddp-client/models";

import {
  IDDPCollectionStore,
  IDDPDocument,
  IDDPMessageDocument,
  IDDPMessageDocumentAdded,
  IDDPMessageDocumentChanged,
  IDDPMessageDocumentRemoved,
} from "./models";

import * as EJSON from "ejson";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/distinct";
import "rxjs/add/operator/map";

import { Observable } from "rxjs/Observable";
import { timer as timerObservable } from "rxjs/observable/timer";
import { ReplaySubject } from "rxjs/ReplaySubject";

export class Collection {
  public collection: ReplaySubject<IDDPDocument[]> = new ReplaySubject(1);

  public documentSubscription: Observable<IDDPMessageDocument>;
  public addedDocumentSubscription: Observable<IDDPMessageDocumentAdded>;
  public changedDocumentSubscription: Observable<IDDPMessageDocumentChanged>;
  public removedDocumentSubscription: Observable<IDDPMessageDocumentRemoved>;

  public ddpClient: IDDPClient;

  private name: string;
  private store: IDDPCollectionStore = new Map<string, IDDPDocument>();

  constructor(name: string, ddpClient?: IDDPClient) {
    // This bit of code allows us to mock DDPClient with a alternate class or a localized instance of DDPClient
    if (ddpClient) {
      this.ddpClient = ddpClient;
    } else {
      this.ddpClient = DDPClient.instance;
    }

    this.name = name;

    // Create observables for collection related messages
    this.documentSubscription = this.ddpClient.ddpSubscription.filter(
      (msgObj) => {
        return msgObj.collection === this.name;
      }
    );
    this.addedDocumentSubscription = this.documentSubscription.filter(
      (msgObj) => {
        return msgObj.msg === "added";
      }
    );
    this.changedDocumentSubscription = this.documentSubscription.filter(
      (msgObj) => {
        return msgObj.msg === "changed";
      }
    );
    this.removedDocumentSubscription = this.documentSubscription.filter(
      (msgObj) => {
        return msgObj.msg === "removed";
      }
    );

    // Dispatch observable subscriptions to their handlers
    this.addedDocumentSubscription.subscribe(this.handleAdded.bind(this));
    this.changedDocumentSubscription.subscribe(this.handleChanged.bind(this));
    this.removedDocumentSubscription.subscribe(this.handleRemoved.bind(this));

    // Initializing first property for collection in case someone subscribes too early
    this.collection.next([]);
  }

  public findOne(key: string): Observable<IDDPDocument> {
    return this.collection.map(() => {
      return this.store.get(key);
    }).distinct().debounce(() => timerObservable(100));
  }

  private handleAdded(msgObj: IDDPMessageDocumentAdded) {
    let cloneMsgObj = EJSON.clone(msgObj);
    if (this.store.has(cloneMsgObj.id)) {
      throw Error("Duplicate _id '" + cloneMsgObj.id + "found for collection " + this.name + " in 'added' ddp message");
    }

    this.store.set(cloneMsgObj.id, cloneMsgObj.fields);
    this.collection.next(this.getCollectionAsArray());
  }

  private handleChanged(msgObj: IDDPMessageDocumentChanged) {
    let cloneMsgObj = EJSON.clone(msgObj);
    let fields: any = cloneMsgObj.fields;
    let document: IDDPDocument = EJSON.clone(this.store.get(cloneMsgObj.id));
    if (!this.store.has(cloneMsgObj.id)) {
      throw Error("_id '" + cloneMsgObj.id + "' not found for collection " + this.name + " in 'removed' ddp message");
    }

    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        document[key] = fields[key];
      }
    }
    this.store.set(cloneMsgObj.id, document);
    this.collection.next(this.getCollectionAsArray());
  }

  private handleRemoved(msgObj: IDDPMessageDocumentRemoved) {
    let cloneMsgObj = EJSON.clone(msgObj);
    if (!this.store.delete(cloneMsgObj.id)) {
      throw Error("_id '" + cloneMsgObj.id + "' not found for collection " + this.name + " in 'removed' ddp message");
    }
    this.collection.next(this.getCollectionAsArray());
  }

  private getCollectionAsArray(): IDDPDocument[] {
    let retval: IDDPDocument[] = [];
    this.store.forEach((value: IDDPDocument, key: string) => {
      let valueClone = EJSON.clone(value);
      valueClone._id = key;
      retval.push(valueClone);
    });
    return retval;
  }
}
