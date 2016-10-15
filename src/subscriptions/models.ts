import { IDDPErrorObject } from "../ddp-client/models";

export interface IDDPMessageSubscriptionSubscribe {}

export interface IDDPMessageSubscriptionNosub {
  msg: string;
  error?: IDDPErrorObject;
  id: string;
}

export interface IDDPMessageSubscriptionReady {
  msg: string;
  subs: string[];
}

export interface ISubscriptionCallStore {
  errorCallback: Function;
  inactive: boolean;
  name: string;
  params: any[];
  ready: boolean;
  readyCallback: Function;
  stopCallback: Function;
}
