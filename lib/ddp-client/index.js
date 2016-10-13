"use strict";
var EJSON = require("ejson");
var Rx = require("rxjs/Rx");
var DDPClient = (function () {
    function DDPClient() {
        var _this = this;
        this.ddpVersion = "1";
        this.supportedDDPVersions = ["1", "pre2", "pre1"];
        this.callStack = [];
        this.connected = false;
        this.connectedDDP = false;
        this.reauthAttempted = false;
        this.subject = new Rx.Subject();
        this.observer = {
            next: function (message) {
                if (_this.reauthAttempted
                    || _this.connectedDDP && message.msg === "login"
                    || _this.connected && message.msg === "connect") {
                    _this.sendMessageCallback(EJSON.stringify(message));
                }
                else {
                    _this.callStack.push(message);
                }
            }
        };
    }
    DDPClient.Instance = function () {
        return DDPClient.instance;
    };
    DDPClient.prototype.onConnect = function () {
        var _this = this;
        this.connected = true;
        this.sendConnectMessage();
        this.subject
            .filter(function (message) { return message.msg === "connected"; })
            .subscribe(function (connectedMessage) {
            _this.connectedDDP = true;
            _this.keyValueStore.set("DDPSessionId", connectedMessage.session);
            _this.resumeLoginWithToken(function () {
                _this.reauthAttempted = true;
                _this.dispatchBufferedCallStack();
            });
        });
    };
    DDPClient.prototype.messageReceivedCallback = function (message) {
        this.subject.next(EJSON.parse(message));
    };
    DDPClient.prototype.errorCallback = function (error) {
        this.subject.error(error);
    };
    DDPClient.prototype.closeCallback = function () {
        this.subject.complete();
    };
    DDPClient.prototype.sendConnectMessage = function () {
        var connectRequest = {
            msg: "connect",
            support: this.supportedDDPVersions,
            version: this.ddpVersion
        };
        if (this.keyValueStore.has("DDPSessionId")) {
            connectRequest.session = this.keyValueStore.get("DDPSessionId");
        }
        this.observer.next(connectRequest);
    };
    DDPClient.prototype.resumeLoginWithToken = function (callback) {
        var loginToken = this.keyValueStore.get("LoginToken");
        if (loginToken) {
            callback();
        }
        else {
            callback();
        }
    };
    DDPClient.prototype.dispatchBufferedCallStack = function () {
        var _this = this;
        this.callStack.forEach(function (message) {
            _this.sendMessageCallback(EJSON.stringify(message));
        });
        this.callStack = [];
    };
    DDPClient.instance = new DDPClient();
    return DDPClient;
}());
exports.__esModule = true;
exports["default"] = DDPClient;
