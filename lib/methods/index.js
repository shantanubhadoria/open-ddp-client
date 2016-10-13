"use strict";
var ddp_client_1 = require("../ddp-client");
var object_id_1 = require("../object-id");
var Methods = (function () {
    function Methods(ddpClient) {
        if (ddpClient === void 0) { ddpClient = ddp_client_1["default"].Instance(); }
        this.resultCallbacks = new Map();
        this.updatedCallbacks = new Map();
        if (ddpClient) {
            this.ddpClient = ddpClient;
        }
        else {
            this.ddpClient = ddp_client_1["default"].Instance();
        }
        this.ddpClient.subject.filter(function (value) { return value.msg === "result"; })
            .subscribe(this.handleResult.bind(this));
        this.ddpClient.subject.filter(function (value) { return value.msg === "updated"; })
            .subscribe(this.handleUpdated.bind(this));
    }
    Methods.Instance = function () {
        return Methods.instance;
    };
    Methods.prototype.call = function (method, params, resultCallback, updatedCallback) {
        var methodId = new object_id_1["default"]();
        var methodCallMessage = {
            id: methodId.toHexString(),
            method: method,
            msg: "method",
            params: params
        };
        this.resultCallbacks.set(methodId.toHexString(), {
            id: methodId.toHexString(),
            method: method,
            params: params,
            resultCallback: resultCallback
        });
        this.updatedCallbacks.set(methodId.toHexString(), {
            id: methodId.toHexString(),
            method: method,
            params: params,
            updatedCallback: updatedCallback
        });
        this.ddpClient.observer.next(methodCallMessage);
        return methodId.toHexString();
    };
    Methods.prototype.handleResult = function (message) {
        var methodCall = this.resultCallbacks.get(message.id);
        methodCall.resultCallback(message.result, message.error);
        this.resultCallbacks.delete(message.id);
    };
    Methods.prototype.handleUpdated = function (message) {
        var _this = this;
        message.methods.forEach(function (methodId) {
            var methodCall = _this.updatedCallbacks.get(methodId);
            methodCall.updatedCallback({
                id: methodCall.id,
                method: methodCall.method,
                params: methodCall.params
            });
            _this.updatedCallbacks.delete(methodId);
        });
    };
    Methods.instance = new Methods();
    return Methods;
}());
exports.__esModule = true;
exports["default"] = Methods;
