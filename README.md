# open-ddp-client
Platform agnostic ddp client to run in browser, nativescript etc.

```
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
ws.onMessage((message: string) => {
  ddpClient.messageReceivedCallback(message);
});

// error: object with error, reason and code keys.
ws.onError((error) => {
  ddpClient.errorCallback(error);
});

ws.onClose(() => {
  ddpClient.closeCallback();
});

// Attach a handler for handle sending messages from the ddp client
ddpClient.sendMessageCallback = (message: string) => { 
  ws.send(message);
};
// Since ws object also takes a single message string as param this could be simply replaced with this
ddpClient.sendMessageCallback = ws.send;
```

# Using this module in other modules

Here is a quick example of how this module can be used in other modules. The [TypeScript Module Resolution Logic](https://www.typescriptlang.org/docs/handbook/module-resolution.html) makes it quite easy. The file `src/index.ts` acts as an aggregator of all the functionality in this module. It imports from other files and re-exports to provide a unified interface for this module. The _package.json_ file contains `main` attribute that points to the generated `lib/index.js` file and `typings` attribute that points to the generated `lib/index.d.ts` file.

> If you are planning to have code in multiple files (which is quite natural for a NodeJS module) that users can import, make sure you update `src/index.ts` file appropriately.

Now assuming you have published this amazing module to _npm_ with the name `my-amazing-lib`, and installed it in the module in which you need it -

- To use the `Greeter` class in a TypeScript file -

```ts
import { Greeter } from "my-amazing-lib";

const greeter = new Greeter("World!");
greeter.greet();
```

- To use the `Greeter` class in a JavaScript file -

```js
const Greeter = require('my-amazing-lib').Greeter;

const greeter = new Greeter('World!');
greeter.greet();
```
