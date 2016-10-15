# open-ddp-client

Platform agnostic ddp client to run in browser, nativescript etc.

## Badges
[![bitHound Overall Score](https://www.bithound.io/github/shantanubhadoria/open-ddp-client/badges/score.svg)](https://www.bithound.io/github/shantanubhadoria/open-ddp-client)
[![bitHound Dependencies](https://www.bithound.io/github/shantanubhadoria/open-ddp-client/badges/dependencies.svg)](https://www.bithound.io/github/shantanubhadoria/open-ddp-client/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/shantanubhadoria/open-ddp-client/badges/code.svg)](https://www.bithound.io/github/shantanubhadoria/open-ddp-client)

## Install

You can install this package with `npm`.

### npm

```shell
npm install open-ddp-client
```

## Description

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

Type definitions are included so the library can be directly used in your typescript app.

## Author

Shantanu Bhadoria https://www.shantanubhadoria.com

## License
The MIT License

Copyright (c) Shantanu Bhadoria. https://www.shantanubhadoria.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.