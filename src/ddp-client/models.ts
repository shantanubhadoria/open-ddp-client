export interface IKeyValueStore {
  get: Function;
  set: Function;
}

enum DDPMessageType {
  "connect",
  "message"
}

export interface IDDPMessage {
}
