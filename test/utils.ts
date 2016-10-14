/// <reference path="../typings/index.d.ts" />
import { DDPClient } from "../src";
import * as EJSON from "ejson";

/**
 * Creates a unique non singleton DDP Object, instantiates mocked connect sequences and returns the DDP Object.
 */
export function prepareUniqueDDPObject() {
  let ddpClient = new DDPClient();
  ddpClient.keyValueStore = new Map<string, any>();
  ddpClient.connected();
  let connectedMessage = {
    msg: "connected",
    session: "testSessionId"
  };
  ddpClient.subscription.next(EJSON.stringify(connectedMessage));

  return ddpClient;
}