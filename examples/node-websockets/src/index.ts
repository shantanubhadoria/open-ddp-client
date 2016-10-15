import { DDPClient, Accounts } from "../../../src";
import { client as WebSocket } from "websocket";

let ddpClient = DDPClient.instance;
let accounts = Accounts.instance;

ddpClient.keyValueStore = new Map<string, any>();

let client = new WebSocket();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', (connection) => {
  console.log('WebSocket Client Connected');

  ddpClient.sendMessageCallback = (message: string) => {
    console.log("SENDING", message);
    connection.sendUTF(message);
  };


  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log("RECEIVED", message.utf8Data);
      ddpClient.subscription.next(message.utf8Data);
    }
  });

  ddpClient.connected();  
  
  accounts.loginWithPassword("shantanubhadoria","hahaNiceTry");

});

client.connect("ws://127.0.0.1:3000/websocket");