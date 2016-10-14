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
            next: function (msgObj) {
                if (_this.reauthAttempted
                    || _this.connectedDDP && msgObj.msg === "login"
                    || _this.connected && msgObj.msg === "connect") {
                    _this.sendMessageCallback(EJSON.stringify(msgObj));
                }
                else {
                    _this.callStack.push(msgObj);
                }
            }
        };
        this.subject
            .filter(function (msgObj) { return msgObj.msg === "connected"; })
            .subscribe(function (msgObj) {
            _this.connectedDDP = true;
            _this.keyValueStore.set("DDPSessionId", msgObj.session);
            _this.resumeLoginWithToken(function () {
                _this.reauthAttempted = true;
                _this.dispatchBufferedCallStack();
            });
        });
    }
    DDPClient.Instance = function () {
        return DDPClient.instance;
    };
    DDPClient.prototype.onConnect = function () {
        this.connected = true;
        this.sendConnectMessage();
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
