/// <reference path="../typings/index.d.ts" />
import { Methods, Accounts } from "../src";
import {} from "mocha";
import { expect } from "chai";
import * as EJSON from "ejson";
import { prepareUniqueDDPObject } from "./utils";

describe("loginCallWrapper", () => {
  it("should set loginToken, loginTokenExpires in keyValueStore on result callback", () => {
    let ddpClient = prepareUniqueDDPObject();
    let methods = new Methods(ddpClient);
    let accounts = new Accounts(ddpClient, methods);
    ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        console.log(message);
      };
    let methodId = accounts.login([]);
    let expireTime = new Date();
    ddpClient.subscription.next(EJSON.stringify({
      msg: "result",
      id: methodId,
      result: {
        token: "testLoginToken",
        tokenExpires: expireTime,
      }
    }));

    expect(ddpClient.keyValueStore.get("loginToken")).to.equal("testLoginToken");
    expect(ddpClient.keyValueStore.get("loginTokenExpires")).to.equal(EJSON.stringify(expireTime));
  })
});