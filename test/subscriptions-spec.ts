/// <reference path="../typings/index.d.ts" />
import { Subscriptions } from "../src";

import { prepareUniqueDDPObject } from "./utils";

import { expect } from "chai";
import * as EJSON from "ejson";
import "mocha";

describe("DDPClient Subscriptions", () => {
  describe("call without params", () => {
    it("should send a {msg:\"method\"...} message", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);

      ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        expect(msgObj.msg).to.equal("sub");
        expect(msgObj.name).to.equal("testSub");
        expect(msgObj.params).to.be.a("undefined");
        done();
      };
      subscriptions.subscribe("testSub");
    });
  });

  describe("call with params", () => {
    it("should send a {msg:\"sub\", name:\"subName\", params: [...] ...} message", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);
      let params = [
        "a",
        {
          a: "a",
          b: "b",
        },
      ];
      ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        expect(msgObj.msg).to.equal("sub");
        expect(msgObj.name).to.equal("testSub");
        expect(msgObj.params).to.eql(params);
        done();
      };
      subscriptions.subscribe("testSub", params);
    });
  });

  describe("call with ready callback", () => {
    it("should trigger ready callback on receiving ready status for sub", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);

      let readyCallback = () => {
        done();
      };
      let subscriptionId = subscriptions.subscribe("testSub", undefined, readyCallback);
      let readyMessage = {
        msg: "ready",
        subs: [subscriptionId],
      };
  
      ddpClient.subscription.next(EJSON.stringify(readyMessage));
    });
  });

  describe("on receiving unsub status for subscription", () => {
    it("should trigger stop callback", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);

      let stopCallback = () => {
        done();
      };
      let subscriptionId = subscriptions.subscribe("testSub", undefined, undefined, undefined, stopCallback);
      let unsubMessage = {
        id: subscriptionId,
        msg: "nosub",
      };

      ddpClient.subscription.next(EJSON.stringify(unsubMessage));
    });
  });

  describe("on receiving unsub status for subscription with error", () => {
    it("should trigger stop callback", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);

      let stopCallback = () => {
        done();
      };
      let subscriptionId = subscriptions.subscribe("testSub", undefined, undefined, undefined, stopCallback);
      let unsubMessage = {
        id: subscriptionId,
        msg: "nosub",
        error: {
          reason: "reason 1",
        },
      };
      
      ddpClient.subscription.next(EJSON.stringify(unsubMessage));
    });

    it("should trigger error callback", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let subscriptions = new Subscriptions(ddpClient);

      let errorCallback = () => {
        done();
      };
      let subscriptionId = subscriptions.subscribe("testSub", undefined, undefined, errorCallback);
      let unsubMessage = {
        id: subscriptionId,
        msg: "nosub",
        error: {
          reason: "reason 1",
        },
      };
      
      ddpClient.subscription.next(EJSON.stringify(unsubMessage));
    });
  });
});