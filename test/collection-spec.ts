/// <reference path="../typings/index.d.ts" />
import { Collection } from "../src";
import {
  IDDPDocument,
  IDDPMessageDocumentAdded,
  IDDPMessageDocumentChanged,
  IDDPMessageDocumentRemoved,
} from "../src/collection/models";

import { prepareUniqueDDPObject } from "./utils";

import { expect } from "chai";
import * as EJSON from "ejson";
import "mocha";

describe("Collection", () => {
  describe("collection attribute", () => {
    let collectionName = "testCollection";
    let ddpClient = prepareUniqueDDPObject();
    let testCollection = new Collection(collectionName, ddpClient);

    it("should return empty array if nothing is initialized", (done) => {
      let subscription = testCollection.collection.subscribe((collection: Array<IDDPDocument>) => {
        expect(collection).to.eql([]);
        done();
      });
      subscription.unsubscribe();
    });

    it("should trigger with new value on added message after subscription", (done) => {
      let addedMessage: IDDPMessageDocumentAdded = {
        collection: collectionName,
        fields: {
          _id: "testId1",
          testField: "testField1",
        },
        id: "testId1",
        msg: "added",
      };
      let subscription = testCollection.collection.subscribe((collection: Array<IDDPDocument>) => {
        // Skip initial empty value
        if (collection.length > 0) {
          expect(collection).to.eql(
            [
              {
                _id: "testId1",
                testField: "testField1"
              }
            ]
          );
          done();
        }
      });
      ddpClient.subscription.next(EJSON.stringify(addedMessage));
      subscription.unsubscribe();
    });

    it("should show last value on subscription(Replay last) initialization even if there are no new messages", (done) => {
      let subscription = testCollection.collection.subscribe((collection: IDDPDocument[]) => {
        // Skip initial empty value
        if (collection.length > 0) {
          expect(collection).to.eql(
            [
              {
                _id: "testId1",
                testField: "testField1"
              }
            ]
          );
          done();
        }
      });
      subscription.unsubscribe();
    });

    it("should trigger on next added message with aggregated values", (done) => {
      let addedMessage: IDDPMessageDocumentAdded = {
        collection: collectionName,
        fields: {
          _id: "testId2",
          testField: "testField2",
          testObject: {
            a: "b",
            c: "d",
          },
        },
        id: "testId2",
        msg: "added",
      };
      let subscription = testCollection.collection.subscribe((collection: IDDPDocument[]) => {
        // Skip initial empty value
        if (collection.length > 1) {
          expect(collection).to.eql([
            {
              _id: "testId1",
              testField: "testField1"
            },
            {
              _id: "testId2",
              testField: "testField2",
              testObject: {
                a: "b",
                c: "d",
              },
            }
          ]);
          done();
        }
      });
      ddpClient.subscription.next(EJSON.stringify(addedMessage));
      subscription.unsubscribe();
    });

    it("should trigger next with updated collection on changed message", (done) => {
      let updatedMessage: IDDPMessageDocumentChanged = {
        collection: collectionName,
        fields: {
          newArrayField: ["a", "b", "c"],
          newField: "newFieldValue",
          newObjectField: {
            a: "b",
            c: "d",
          },
          testField: "testField2Updated",
          testObject: {
            c: "e",
            f: "g",
          },
        },
        id: "testId2",
        msg: "changed",
      };
      let subscription = testCollection.collection.subscribe((collection: IDDPDocument[]) => {
        // Skip initial empty value
        for (let key in collection) {
          let document = collection[key];
          if (document["testField"] === "testField2Updated") {
            expect(collection).to.eql([
              {_id:"testId1", testField:"testField1"},
              {
                _id:"testId2",
                newArrayField: ["a", "b", "c"],
                newField: "newFieldValue",
                newObjectField: {
                  a: "b",
                  c: "d",
                },
                testField:"testField2Updated",
                testObject: {
                  c: "e",
                  f: "g",
                },
              },
            ]);
            done();
          }
        }
      });
      ddpClient.subscription.next(EJSON.stringify(updatedMessage));
      subscription.unsubscribe();
    });

    it("should delete on removed message", (done) => {
      let removedMessage: IDDPMessageDocumentRemoved = {
        collection: collectionName,
        id: "testId2",
        msg: "removed",
      };
      let subscription = testCollection.collection.subscribe((collection: IDDPDocument[]) => {
        if (collection.length < 2) {
          expect(collection).to.eql(
            [
              {
                _id: "testId1",
                testField: "testField1"
              },
            ]
          );
          done();
        }
      });
      ddpClient.subscription.next(EJSON.stringify(removedMessage));
      subscription.unsubscribe();
    });
  });
});