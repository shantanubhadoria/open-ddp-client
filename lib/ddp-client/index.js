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
        var observable = Rx.Observable.create(function (obs) {
            _this.messageReceivedCallback = obs.next.bind(obs);
        });
        var observer = {
            next: function (message) {
                if (_this.connected) {
                    _this.sendMessageCallback(EJSON.stringify(message));
                }
                else {
                    _this.callStack.push(message);
                }
            }
        };
        this.subject = Rx.Subject.create(observer, observable);
    }
    DDPClient.Instance = function () {
        return DDPClient.instance;
    };
    DDPClient.prototype.onConnect = function () {
        this.connected = true;
        this.sendConnectMessage();
        this.resumeLoginWithToken();
        this.dispatchBufferedCallStack();
    };
    DDPClient.prototype.onMessageReceived = function (message) {
        this.subject.next(EJSON.parse(message));
    };
    DDPClient.prototype.onError = function (error) {
        this.subject.error(error);
    };
    DDPClient.prototype.onClose = function () {
        this.connected = false;
        this.subject.complete();
    };
    DDPClient.prototype.onMessageSend = function (callback) {
        this.sendMessageCallback = callback;
    };
    DDPClient.prototype.sendConnectMessage = function () {
        var connectRequest = {
            msg: "connect",
            support: this.supportedDDPVersions,
            version: this.ddpVersion
        };
        var sessionId = this.keyValueStore.get("DDPSessionId");
        if (sessionId) {
            connectRequest.session = sessionId;
        }
        this.subject.next(connectRequest);
    };
    DDPClient.prototype.resumeLoginWithToken = function () {
        var loginToken = this.keyValueStore.get("LoginToken");
        if (loginToken) {
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
exports.DDPClient = DDPClient;
