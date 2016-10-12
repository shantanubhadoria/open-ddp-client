import { DDPClient } from "../src/ddp-client";
import {} from "mocha";
import { expect } from "chai";

describe("ddpclient", () => {
  it("Should provide a instance of DDPClient", () => {
    const ddpClient = DDPClient.Instance();
    expect(ddpClient).to.be.instanceof(DDPClient);
  });

  it("Should accept Keyvalue store with get and set", () => {
    const ddpClient = DDPClient.Instance();
    class KeyValueStore {
      get() {}
      set() {}
    }
    let keyValueStore = new KeyValueStore();
    
    expect(() => {
      ddpClient.keyValueStore = keyValueStore;
    }).to.not.throw('Unable to assign a key value store');
  });

  it("Should give on connect message on calling onConnect", (done) => {
    const ddpClient = DDPClient.Instance();
    ddpClient.onMessageSend((message: any) => {
      done();
    });
    ddpClient.onConnect();
  });
});
