export interface IDDPDocument {
  _id: string;
  [key: string]: any;
}

export interface IDDPMessageDocument {
  msg: string;
  collection: string;
}

export interface IDDPMessageDocumentAdded {
  msg: string;
  collection: string;
  id: string;
  fields: IDDPDocument;
}

export interface IDDPMessageDocumentChanged {
  msg: string;
  collection: string;
  id: string;
  fields: Object;
}

export interface IDDPMessageDocumentRemoved {
  msg: string;
  collection: string;
  id: string;
}
