import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import { DDPClient } from '../packages/ddp-client';

var ddpClient = DDPClient.getInstance();

@suite("ddp basic tests")
class TestDDPBasic {
    @test "check "
    checkOnConnect(done){
      let receivedMessages = false;
      ddpClient.onMessageSend = (message) => {
        console.log('message');
        receivedMessages = true;
      };
      setTimeout(() => {
        if(receivedMessages) {
          var error = new Error("Assert failed");
          (<any>error).expected = "expecteds";
          (<any>error).actual = "to faill";
          throw error;
        } else {
          done();
        }
      }, 100)
      ddpClient.onConnect();
    }
}
