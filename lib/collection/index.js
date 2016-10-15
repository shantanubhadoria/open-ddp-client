"use strict";
var ddp_client_1 = require("../ddp-client");
var EJSON = require("ejson");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var Collection = (function () {
    function Collection(name, ddpClient) {
        var _this = this;
        this.collection = new ReplaySubject_1.ReplaySubject(1);
        this.store = new Map();
        if (ddpClient) {
            this.ddpClient = ddpClient;
        }
        else {
            this.ddpClient = ddp_client_1.DDPClient.instance;
        }
        this.name = name;
        this.documentSubscription = this.ddpClient.ddpSubscription.filter(function (msgObj) {
            return msgObj.collection === _this.name;
        });
        this.addedDocumentSubscription = this.documentSubscription.filter(function (msgObj) {
            return msgObj.msg === "added";
        });
        this.changedDocumentSubscription = this.documentSubscription.filter(function (msgObj) {
            return msgObj.msg === "changed";
        });
        this.removedDocumentSubscription = this.documentSubscription.filter(function (msgObj) {
            return msgObj.msg === "removed";
        });
        this.addedDocumentSubscription.subscribe(this.handleAdded.bind(this));
        this.changedDocumentSubscription.subscribe(this.handleChanged.bind(this));
        this.removedDocumentSubscription.subscribe(this.handleRemoved.bind(this));
        this.collection.next([]);
    }
    Collection.prototype.handleAdded = function (msgObj) {
        var cloneMsgObj = EJSON.clone(msgObj);
        if (this.store.has(cloneMsgObj.id)) {
            throw Error("Duplicate _id '" + cloneMsgObj.id + "found for collection " + this.name + " in 'added' ddp message");
        }
        this.store.set(cloneMsgObj.id, cloneMsgObj.fields);
        this.collection.next(this.getCollectionAsArray());
    };
    Collection.prototype.handleChanged = function (msgObj) {
        var cloneMsgObj = EJSON.clone(msgObj);
        var fields = cloneMsgObj.fields;
        var document = EJSON.clone(this.store.get(cloneMsgObj.id));
        if (!this.store.has(cloneMsgObj.id)) {
            throw Error("_id '" + cloneMsgObj.id + "' not found for collection " + this.name + " in 'removed' ddp message");
        }
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                document[key] = fields[key];
            }
        }
        this.store.set(cloneMsgObj.id, document);
        this.collection.next(this.getCollectionAsArray());
    };
    Collection.prototype.handleRemoved = function (msgObj) {
        var cloneMsgObj = EJSON.clone(msgObj);
        if (!this.store.delete(cloneMsgObj.id)) {
            throw Error("_id '" + cloneMsgObj.id + "' not found for collection " + this.name + " in 'removed' ddp message");
        }
        this.collection.next(this.getCollectionAsArray());
    };
    Collection.prototype.getCollectionAsArray = function () {
        var retval = [];
        this.store.forEach(function (value, key) {
            retval.push(value);
        });
        return retval;
    };
    return Collection;
}());
exports.Collection = Collection;
