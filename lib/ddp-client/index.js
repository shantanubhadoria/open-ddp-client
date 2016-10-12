"use strict";
var Rx = require("rxjs/Rx");
var DDPClient = (function () {
    function DDPClient() {
        var _this = this;
        this.ddpVersion = "1";
        this.supportedDDPVersions = ["1", "pre2", "pre1"];
        this.callStack = [];
        this.instantiated = false;
        this.connected = false;
        this.sendMessageCallbacks = [];
        var observable = Rx.Observable.create();
        var observer = {
            next: function (message) {
                if (_this.connected) {
                    _this.sendMessageCallbacks.forEach(function (callback) {
                        callback(message);
                    });
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
    };
    DDPClient.prototype.onMessageReceived = function (message) {
        this.subject.next(message);
    };
    DDPClient.prototype.onError = function (error) {
        this.subject.error(error);
    };
    DDPClient.prototype.onClose = function () {
        this.subject.complete();
    };
    DDPClient.prototype.onMessageSend = function (callback) {
        this.sendMessageCallbacks.push(callback);
    };
    DDPClient.instance = new DDPClient();
    return DDPClient;
}());
exports.DDPClient = DDPClient;
