import { IDDPErrorObject } from "../ddp-client/models";

export interface IDDPMessageMethodCall {
  msg: string;
  id: string;
  method: string;
  params?: Array<any>;
}

export interface IDDPMessageMethodResult {
  msg: string;
  id: string;
  result: any;
  error: IDDPErrorObject;
}

export interface IDDPMessageMethodUpdated {
  msg: string;
  methods: string[];
}

export interface IMethodCallStore {
  id: string;
  method: string;
  params?: Array<any>;
  resultCallback?: Function;
  updatedCallback?: Function;
}
