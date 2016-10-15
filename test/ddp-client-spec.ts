/// <reference path="../typings/index.d.ts" />
import { DDPClient, Accounts } from "../src";

import { expect } from "chai";
import * as EJSON from "ejson";
import "mocha";

describe("DDPClient", () => {

  describe("while setting params", () => {
    it("should accept Keyvalue store with get and set", () => {
        let ddpClient = new DDPClient();  
        class KeyValueStore {
        get(key: string) {}
        set(key: string, value: any) {}
        has(): boolean {
            return true;
        }
        }
        let keyValueStore = new KeyValueStore();
        
        expect(() => {
        ddpClient.keyValueStore = keyValueStore;
        }).to.not.throw('Unable to assign a key value store');
    });
  });
  
  describe("after onConnected()", () => {

    describe("on receiving {msg: \"connected\"}", () => {
      it("should set session id in keystore", () => {
        let ddpClient = new DDPClient();
        ddpClient.keyValueStore = new Map<string, any>();
        ddpClient.connected();
        let connectedMessage = {
          msg: "connected",
          session: "testSessionId"
        };
        ddpClient.subscription.next(EJSON.stringify(connectedMessage));
        expect(ddpClient.keyValueStore.get("DDPSessionId")).to
        .equal("testSessionId");
      });
    });

    it("should send a connect message to the server", (done) => {
      let ddpClient = new DDPClient();
      ddpClient.keyValueStore = new Map<string, any>();
      ddpClient.sendMessageCallback = (message: string) => {
        // Intercepting message sent to server
        let msgObj = EJSON.parse(message);
        if (msgObj.msg === "connect") {
          expect(msgObj.support).to.be.a("array");
          expect(msgObj.version).to.be.a("string");
          done();
        }
      };
      ddpClient.connected();
    });

    describe("when a previous session id exists", () => {
      it("should resend session id", (done) => {
        let ddpClient = new DDPClient();
        ddpClient.keyValueStore = new Map<string, any>();
        ddpClient.keyValueStore.set("DDPSessionId", "previousSessionId");
        ddpClient.sendMessageCallback = (message: string) => {
          // Intercepting message sent to server
          let msgObj = EJSON.parse(message);
          if (msgObj.msg === "connect") {
            expect(msgObj.support).to.be.a("array");
            expect(msgObj.version).to.be.a("string");
            expect(msgObj.session).to.equal("previousSessionId");
            done();
          }
        };
        ddpClient.connected();
      });
    });

    describe("when a previous login token exists", () => {
      it("should attempt auth with token after connected", (done) => {
        let ddpClient = new DDPClient();
        ddpClient.keyValueStore = new Map<string, any>();
        ddpClient.keyValueStore.set("DDPSessionId", "previousSessionId");
        ddpClient.keyValueStore.set("LoginToken", "previousLoginToken");
        // Make sure all singletons uses this DDP object for proper interception
        Accounts.instance.ddpClient = ddpClient;
        Accounts.instance.methodsObject.ddpClient = ddpClient;

        ddpClient.sendMessageCallback = (message: string) => {
          // Intercepting message sent to server
          let msgObj = EJSON.parse(message);
          if (msgObj.msg === "method" && msgObj.method === "login") {
            expect(msgObj.params).to.be.a("array");
            expect(msgObj.params[0]).to.be.a("object");
            expect(msgObj.params[0].resume).to.equal("previousLoginToken");
            done();
          }
        };
        ddpClient.connected();
        let connectedMessage = {
          msg: "connected",
          session: "testSessionId"
        };
        ddpClient.subscription.next(EJSON.stringify(connectedMessage));
      });
    });
  });

  describe("after onConnected(), and {msg:\"connected\"} received", () => {
    describe("if a message is sent before initiation proceedures ", () => {
      it("make sure its called after initiation", (done) => {
        let ddpClient = new DDPClient();
        ddpClient.keyValueStore = new Map<string, any>();
        ddpClient.sendMessageCallback = (message: string) => {
          // Intercepting message sent to server
          let msgObj = EJSON.parse(message);
          if (msgObj.msg === "testMessage") {
            done();
          }
        };

        ddpClient.send({
          msg: "testMessage"
        });
        ddpClient.connected();
        let connectedMessage = {
          msg: "connected",
          session: "testSessionId"
        };
        ddpClient.subscription.next(EJSON.stringify(connectedMessage));
      });
    });
  });
});