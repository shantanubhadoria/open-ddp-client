import { DDPClient, EJSON, Methods } from "../src";
import {} from "mocha";
import { expect } from "chai";

let connectedMessage = '{"msg":"connected", "session": "testSessionID"}';

describe("ddp methods call without params", () => {
  it("send a message on ddp", (done) => {
    let ddpClient = DDPClient.Instance();
    ddpClient.sendMessageCallback = (message: string) => {
      console.log("sending", message);
    };
    ddpClient.subject.subscribe((message) => {
      console.log("received", message);
    });
    ddpClient.observer.next('{"msg":"connect", "session": "testSessionIDr"}');
    ddpClient.subject.next('{"msg":"connected", "session": "testSessionIDr"}');
    ddpClient.onConnect();

  /*
  ddpClient.keyValueStore = new Map<string, any>();
  it("send a message on ddp", (done) => {
    ddpClient.sendMessageCallback = (message: string) => {
      let msgObj = EJSON.parse(message);
      console.log(message);
      if(msgObj.msg === "method") {
        expect(msgObj.method).to.equal("testMethod");
        expect(msgObj.id).to.be.a("string");
        expect(msgObj.params).to.be.an("undefined");
        done();
      }
    };
    ddpClient.subject.next('{"msg":"connected", "session": "testSessionIDr"}');
    //ddpClient.observer.next('{"msg":"connected", "session": "testSessionIDr"}');
    ddpClient.messageReceivedCallback('{"msg":"connected", "session": "testSessionIDr"}');
    ddpClient.onConnect();
    ddpClient.observer.next('{"msg":"connected", "session": "testSessionIDr"}');
    ddpClient.observer.next('{"msg":"connected", "session": "testSessionIDr"}');
    ddpClient.messageReceivedCallback('{"msg":"connected", "session": "testSessionIDr"}');
    
    methods.call("testMethod1");
    */
  });
});

describe("ddp methods call with params", () => {
  let ddpClient = DDPClient.Instance();
  let methods = Methods.Instance();
  ddpClient.keyValueStore = new Map<string, any>();
  it("send a message on ddp", (done) => {
    ddpClient.sendMessageCallback = (message: string) => {
      let msgObj = EJSON.parse(message);
      if(msgObj.msg === "method") {
        expect(msgObj.method).to.equal("testMethod");
        expect(msgObj.id).to.be.a("string");
        expect(msgObj.params).to.not.be.an("undefined");
        done();
      }
    };
    ddpClient.onConnect();
    ddpClient.messageReceivedCallback(connectedMessage);
    
    methods.call("testMethod", ["aa", {aa:"aa"}]);
  });
});

describe("ddp methods call with callbacks", () => {
  let ddpClient = DDPClient.Instance();
  let methods = Methods.Instance();
  ddpClient.keyValueStore = new Map<string, any>();
  it("should trigger next on message received", () => {
    let subscription = ddpClient.subject.subscribe((msgObj: any) => {
      console.log("RECEIVED", EJSON.stringify(msgObj));
      //expect(msgObj.msg).to.equal("connected");
    });
    let subscription2 = ddpClient.subject.subscribe((msgObj: any) => {
      console.log("RECEIVED2", EJSON.stringify(msgObj));
      //expect(msgObj.msg).to.equal("connected");
    });
    ddpClient.messageReceivedCallback(connectedMessage);

  });
  /*
  it("call updated callback", (done) => {
    let ddpClient = DDPClient.Instance();
    let methods = Methods.Instance();
    ddpClient.keyValueStore = new Map<string, any>();
    ddpClient.subject.subscribe((msgObj) => {
      console.log("RECEIVED", EJSON.stringify(msgObj));
    });
    ddpClient.onConnect();
    ddpClient.messageReceivedCallback(connectedMessage);   
    
    ddpClient.sendMessageCallback = (message: string) => {
      console.log("SENT", message);
    };



    let methodId = methods.call("testMethod", ["aa"], () => {
      console.log("result");
    }, () => {
      console.log("updated");
    });

    ddpClient.messageReceivedCallback(EJSON.stringify({
      msg: "updated",
      methods: [
        methodId
      ]
    }));
  });
  */
});