export interface IKeyValueStore {
    get: Function;
    set: Function;
}
export interface IDDPMessage {
    msg?: string;
    version?: string;
    support?: string[];
    session?: string;
}
