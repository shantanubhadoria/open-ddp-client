"use strict";
var ddp_client_1 = require("../ddp-client");
var object_id_1 = require("../object-id");
var Methods = (function () {
    function Methods(ddpClient) {
        this.resultCallbacks = new Map();
        this.updatedCallbacks = new Map();
        if (ddpClient) {
            this.ddpClient = ddpClient;
        }
        else {
            this.ddpClient = ddp_client_1.DDPClient.instance;
        }
        this.resultMessageSubscription = this.ddpClient.ddpSubscription.filter(function (msgObj) {
            return msgObj.msg === "result";
        });
        this.updatedMessageSubscription = this.ddpClient.ddpSubscription.filter(function (msgObj) {
            return msgObj.msg === "updated";
        });
        this.resultMessageSubscription.subscribe(this.handleResult.bind(this));
        this.updatedMessageSubscription.subscribe(this.handleUpdated.bind(this));
    }
    Methods.prototype.call = function (method, params, resultCallback, updatedCallback) {
        var methodId = new object_id_1.ObjectId();
        var methodIdStr = methodId.toHexString();
        var methodCallMessage = {
            id: methodId.toHexString(),
            method: method,
            msg: "method",
            params: params
        };
        if (resultCallback) {
            this.resultCallbacks.set(methodId.toHexString(), {
                id: methodId.toHexString(),
                method: method,
                params: params,
                resultCallback: resultCallback
            });
        }
        if (updatedCallback) {
            this.updatedCallbacks.set(methodId.toHexString(), {
                id: methodId.toHexString(),
                method: method,
                params: params,
                updatedCallback: updatedCallback
            });
        }
        this.ddpClient.send(methodCallMessage);
        return methodIdStr;
    };
    Methods.prototype.handleResult = function (msgObj) {
        var methodStoreItem = this.resultCallbacks.get(msgObj.id);
        methodStoreItem.resultCallback(msgObj.result, msgObj.error);
        this.resultCallbacks.delete(msgObj.id);
    };
    Methods.prototype.handleUpdated = function (msgObj) {
        var _this = this;
        msgObj.methods.forEach(function (methodId) {
            var methodStoreItem = _this.updatedCallbacks.get(methodId);
            methodStoreItem.updatedCallback();
            _this.updatedCallbacks.delete(methodId);
        });
    };
    Methods.instance = new Methods();
    return Methods;
}());
exports.Methods = Methods;
