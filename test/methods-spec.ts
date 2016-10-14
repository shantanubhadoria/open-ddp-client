/// <reference path="../typings/index.d.ts" />
import { Methods } from "../src";
import {} from "mocha";
import { expect } from "chai";
import * as EJSON from "ejson";
import { prepareUniqueDDPObject } from "./utils";

describe("DDPClient Methods", () => {
  describe("call without params", () => {
    it("should send a {msg:\"method\"...} message", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let methods = new Methods(ddpClient); 

      ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        if (msgObj.msg === "method") {
          expect(msgObj.method).to.equal("testMethodName");
          expect(msgObj.params).to.be.a("undefined");
          done();
        }
      };
      let methodId = methods.call("testMethodName");
    });
  });

  describe("call with params", () => {
    it("should send a {msg:\"method\", params: [...] ...} message", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let methods = new Methods(ddpClient); 

      ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        if (msgObj.msg === "method") {
          expect(msgObj.method).to.equal("testMethodName");
          expect(msgObj.params).to.be.a("array");
          done();
        }
      };
      let methodId = methods.call("testMethodName", ["a","b"]);
    });
  });
  
  describe("call with updated callback", () => {
    it("should trigger updated callback on receiving updated status for method", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let methods = new Methods(ddpClient); 

      let updatedCallback = () => {
        done();
      };
      let methodId = methods.call("testMethodName", ["a","b"], undefined, updatedCallback);
      let updatedMessage = {
        msg: "updated",
        methods: [methodId],
      };
      ddpClient.subscription.next(EJSON.stringify(updatedMessage));
    });
  });

  describe("call with result callback", () => {
    it("should trigger result callback with result and error on receiving result", (done) => {
      let ddpClient = prepareUniqueDDPObject();
      let methods = new Methods(ddpClient); 

      let resultCallback = () => {
        done();
      };
      let methodId = methods.call("testMethodName", ["a","b"], resultCallback);
      let resultMessage = {
        msg: "result",
        id: methodId,
        result: "testResult",
        error: "error"
      };
      ddpClient.subscription.next(EJSON.stringify(resultMessage));
    });
  });
});
