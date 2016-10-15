/// <reference path="../typings/index.d.ts" />
import { Accounts, Methods } from "../src";

import { prepareUniqueDDPObject } from "./utils";

import { expect } from "chai";
import * as EJSON from "ejson";
import "mocha";

describe("login()", () => {
  it("should set loginToken, loginTokenExpires in keyValueStore from result", () => {
    let ddpClient = prepareUniqueDDPObject();
    let methods = new Methods(ddpClient);
    let accounts = new Accounts(ddpClient, methods);
    ddpClient.sendMessageCallback = (message: string) => {
      // Intercepting message sent to server
      return true;
    };
    let methodId = accounts.login([]);
    let expireTime = new Date();
    ddpClient.subscription.next(EJSON.stringify({
      id: methodId,
      msg: "result",
      result: {
        token: "testLoginToken",
        tokenExpires: expireTime,
      },
    }));

    expect(ddpClient.keyValueStore.get("loginToken")).to.equal("testLoginToken");
    expect(ddpClient.keyValueStore.get("loginTokenExpires")).to.equal(EJSON.stringify(expireTime));
  });
});
