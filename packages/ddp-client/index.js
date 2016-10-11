"use strict";
var Rx = require('rxjs/Rx');
var DDPClient = (function () {
    function DDPClient() {
        var _this = this;
        this.__ddpVersion = "1";
        this.__supportedDDPVersions = ["1", "pre2", "pre1"];
        this.__callStack = [];
        this.__instantiated = false;
        this.__connected = false;
        this.__sendMessage = function () { };
        var observable = Rx.Observable.create(function (obs) { });
        var observer = {
            next: function (message) {
                if (_this.__connected) {
                    _this.__sendMessage(message);
                }
                else {
                    _this.__callStack.push(message);
                }
            }
        };
        this.subject = Rx.Subject.create(observer, observable);
    }
    DDPClient.getInstance = function () {
        return DDPClient._instance;
    };
    DDPClient.prototype.onConnect = function () {
        this.__connected = true;
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
        this.__sendMessage = callback;
    };
    DDPClient._instance = new DDPClient(); // Singleton
    return DDPClient;
}());
exports.DDPClient = DDPClient;
