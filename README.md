# open-ddp-client
Platform agnostic ddp client to run in browser, nativescript etc.

import { DDPClient } from 'ddp-client';
import { WebSocket } from 'websockets';

var ddpClient = DDPClient.getInstance();

// PersistentKeyValueStore must be a object with atleast a get and set method.
// This may be any store available for your platform
ddpClient.keyValueStore = PersistentKeyValueStore;

// Use any websocket library available for your platform here
var ws = new websocket('ws://192.168.0.1:3000/websocket');

// Attach onConnect, on Message, on Error and onComplete events to the ddp client:
ws.onConnect(() => {
  ddpClient.onConnect();
});

// message: string
ws.onMessage((message) => {
  ddpClient.onMessageReceived(message);
});

// error: object with error, reason and code keys.
ws.onError((error) => {
  ddpClient.onError(error);
});

ws.onClose(() => {
  ddpClient.onClose();
});

// Attach a handler for handle sending messages from the ddp client
ddpClient.onMessageSend = (message) => {
  ws.send(message);
};
