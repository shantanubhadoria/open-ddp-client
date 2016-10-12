export interface IKeyValueStore {
  get: Function;
  set: Function;
}

enum DDPMessageType {
  "connect",
  "message"
}

export interface IDDPMessage {
  msg?: string;
  version?: string;
  support?: string[];
  session?: string;
}
