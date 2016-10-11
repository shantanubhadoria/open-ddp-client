interface KeyValueStore {
  get: Function,
  set: Function
}

enum DDPMessageType {
    'connect',
    'message'
}
interface DDPMessage {
}
