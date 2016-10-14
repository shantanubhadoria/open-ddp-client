/// <reference path="../typings/index.d.ts" />
import { Methods, Accounts } from "../src";
import {} from "mocha";
import { expect } from "chai";
import * as EJSON from "ejson";
import { prepareUniqueDDPObject } from "./utils";

describe("loginCallWrapper", () => {
  it("should set loginToken, loginTokenExpires in keyValueStore on result callback", (done) => {
    let ddpClient = prepareUniqueDDPObject();
    let methods = new Methods(ddpClient); 
    let accounts = new Accounts(ddpClient, methods);

    let methodId = accounts.login([]);
  })
});