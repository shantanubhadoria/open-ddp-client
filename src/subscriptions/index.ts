import { DDPClient } from "../ddp-client";
import { IDDPClient, IDDPMessage } from "../ddp-client/models";
import { ObjectId } from "../object-id";

import {
  IDDPMessageSubscriptionNosub,
  IDDPMessageSubscriptionReady,
  IDDPMessageSubscriptionSubscribe,
  ISubscriptionCallStore,
} from "./models";

import { Observable } from "rxjs/Observable";

export class Subscriptions {
  public static instance: Subscriptions = new Subscriptions(); // Singleton

  public nosubMessageSubscription: Observable<IDDPMessageSubscriptionNosub>;
  public readyMessageSubscription: Observable<IDDPMessageSubscriptionReady>;

  public ddpClient: IDDPClient;

  private subscriptionStore: Map<string, ISubscriptionCallStore> = new Map<string, ISubscriptionCallStore>();
  private initializedDefaults: boolean = false;

  constructor(ddpClient?: IDDPClient) {
    // This bit of code allows us to mock DDPClient with a alternate class or a localized instance of DDPClient
    if (ddpClient) {
      this.ddpClient = ddpClient;
    } else {
      this.ddpClient = DDPClient.instance;
    }

    // Create observables for subscriptions related messages
    this.nosubMessageSubscription = this.ddpClient.ddpSubscription.filter(
      (msgObj: IDDPMessage) => {
        return msgObj.msg === "nosub";
      }
    );
    this.readyMessageSubscription = this.ddpClient.ddpSubscription.filter(
      (msgObj: IDDPMessage) => {
        return msgObj.msg === "ready";
      }
    );

    // Dispatch observable subscriptions to their handlers
    this.nosubMessageSubscription.subscribe(this.handleNosub.bind(this));
    this.readyMessageSubscription.subscribe(this.handleReady.bind(this));
  }

  public initialize() {
    if (! this.initializedDefaults) {
      this.subscribe("meteor.loginServiceConfiguration");
      this.subscribe("meteor_autoupdate_clientVersions");
      this.initializedDefaults = true;
    }
    
    this.subscriptionStore.forEach((value, key) => {
      this.subscribe(
        value.name,
        value.params,
        value.readyCallback,
        value.errorCallback,
        value.stopCallback,
        key,
      );
    });
  }

  public subscribe(
    name: string,
    params?: Array<any>,
    readyCallback?: Function,
    errorCallback?: Function,
    stopCallback?: Function,
    subscriptionIdStr?: string,
  ) {
    if (! subscriptionIdStr) {
      let subscriptionId: ObjectId = new ObjectId();
      subscriptionIdStr = subscriptionId.toHexString();
    }
    let subscribeMessage: IDDPMessageSubscriptionSubscribe = {
      id: subscriptionIdStr,
      msg: "sub",
      name,
      params,
    };

    let storeObject: ISubscriptionCallStore = {
      inactive: false,
      name,
      params,
      ready: false,
      readyCallback,
      errorCallback,
      stopCallback,
    };
    this.subscriptionStore.set(subscriptionIdStr, storeObject);

    this.ddpClient.send(subscribeMessage);
    return subscriptionIdStr;
  }

  public unsubscribe(subscriptionId: string) {
    this.ddpClient.send({
      id: subscriptionId,
      msg: "unsub",
    });
  }

  private handleNosub(msgObj: IDDPMessageSubscriptionNosub) {
    let subscription: ISubscriptionCallStore = this.subscriptionStore.get(msgObj.id);

    if (msgObj.error && subscription.errorCallback) {
      subscription.errorCallback(
        msgObj.error,
        {
          inactive: subscription.inactive,
          name: subscription.name,
          ready: subscription.ready,
        }
      );
    }

    if (subscription.stopCallback) {
      subscription.stopCallback(
        {
          inactive: subscription.inactive,
          name: subscription.name,
          ready: subscription.ready,
        }
      );
    }
    this.subscriptionStore.delete(msgObj.id);
  }

  private handleReady(msgObj: IDDPMessageSubscriptionReady) {
    msgObj.subs.forEach(subscriptionId => {
      let subscription = this.subscriptionStore.get(subscriptionId);
      if (subscription.readyCallback) {
        subscription.readyCallback(
          {
            inactive: subscription.inactive,
            name: subscription.name,
            ready: subscription.ready,
          }
        );
      }
    });
  }
}
