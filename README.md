# open-ddp-client

Platform agnostic ddp client to run in browser, nativescript etc.

Here is a quick example for using this library using nodejs websocket npm module to talk to the DDP server.

```ts
import { DDPClient, Accounts } from "open-ddp-client";
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
```

# Using this module in your application

This package is inteded as a drop in replacement for Meteor's inbuilt DDP Client. Its a complete rewrite built using
reactive extensions RxJs Observables(and Replay Subjects) written in 
[Typescript](https://www.typescriptlang.org/docs/handbook/module-resolution.html) and compiled into a commonjs module. 
This library uses version 5 of the rxjs library. All observables for collections, socket etc. are exposed for a plugin 
developer to expand the functionality of this library.