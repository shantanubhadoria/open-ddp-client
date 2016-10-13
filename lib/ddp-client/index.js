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
        var observable = Rx.Observable.create(function (obs) {
            _this.messageReceivedCallback = function (message) {
                obs.next(EJSON.parse(message));
            };
            _this.errorCallback = obs.error.bind(obs);
            _this.closeCallback = obs.complete.bind(obs);
        });
        var observer = {
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
        this.subject = Rx.Subject.create(observer, observable);
    }
    DDPClient.Instance = function () {
        return DDPClient.instance;
    };
    DDPClient.prototype.onConnect = function () {
        var _this = this;
        this.connected = true;
        this.sendConnectMessage();
        this.subject
            .filter(function (message) { return message.msg === 'connected'; })
            .subscribe(function (connectedMessage) {
            _this.connectedDDP = true;
            _this.keyValueStore.set("DDPSessionId", connectedMessage.session);
            _this.resumeLoginWithToken(function () {
                _this.reauthAttempted = true;
                _this.dispatchBufferedCallStack();
            });
        });
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
    DDPClient.prototype.resumeLoginWithToken = function (callback) {
        var loginToken = this.keyValueStore.get("LoginToken");
        if (loginToken) {
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
exports.DDPClient = DDPClient;
