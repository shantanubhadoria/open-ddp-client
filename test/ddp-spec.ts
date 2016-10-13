import DDPClient from "../src/ddp-client";
import {} from "mocha";
import { expect } from "chai";
import * as EJSON from "ejson";

describe("ddpclient", () => {
  let ddpClient = DDPClient.Instance();
  it("Should provide a instance of DDPClient", () => {
    expect(ddpClient).to.be.instanceof(DDPClient);
  });

  it("Should accept Keyvalue store with get and set", () => {
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

describe("Reconnect without previous session", () => {
  let ddpClient = DDPClient.Instance();
  it("Should send a connect msg on establishing websocket connection", (done) => {
    ddpClient.keyValueStore = new Map<string, any>();
    ddpClient.sendMessageCallback = (message: string) => {
      let msgObj = EJSON.parse(message);
      if(msgObj.msg === "connect") {
        expect(msgObj.version).to.be.a("string");
        expect(msgObj.support).to.be.a("array");
        done();
      }
    };
    ddpClient.onConnect();
  });
});

describe("Reconnect with previous session", () => {
  let ddpClient = DDPClient.Instance();
  it("Should resend a session id if present in key store", (done) => {
    ddpClient.keyValueStore = new Map<string, any>();
    ddpClient.keyValueStore.set("DDPSessionId", "sessionIDForTest");
    ddpClient.sendMessageCallback = (message: string) => {
      let msgObj = EJSON.parse(message);
      if(msgObj.msg === "connect") {
        expect(msgObj.version).to.be.a("string");
        expect(msgObj.support).to.be.a("array");
        expect(msgObj.session).to.equal("sessionIDForTest");
        done();
      }
    };
    ddpClient.onConnect();
  });
});

describe("Subject", () => {
  let ddpClient = DDPClient.Instance();
  it("should trigger next on message received", () => {
    ddpClient.keyValueStore = new Map<string, any>();
    ddpClient.subject.subscribe((msgObj) => {
      expect(msgObj.msg).to.equal("subJecttest");
    });
      
    ddpClient.messageReceivedCallback("{ \"msg\": \"subJecttest\"}");
  });
});