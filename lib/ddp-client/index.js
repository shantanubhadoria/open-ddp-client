"use strict";
var accounts_1 = require("../accounts");
var models_1 = require("./models");
var EJSON = require("ejson");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var DDPClient = (function () {
    function DDPClient() {
        var _this = this;
        this.subscription = new Subject_1.Subject();
        this.ddpSubscription = new Observable_1.Observable();
        this.socketConnectedStatus = false;
        this.DDPConnectedStatus = false;
        this.reauthAttemptedStatus = false;
        this.ddpVersion = "1";
        this.supportedDDPVersions = ["1", "pre2", "pre1"];
        this.callStack = [];
        this.sendMessageCallback = function () { return true; };
        this.ddpSubscription = this.subscription.map(function (value) { return EJSON.parse(value); });
        this.connectedSubscription = this.ddpSubscription.filter(function (msgObj) { return msgObj.msg === "connected"; });
        this.connectedSubscription.subscribe(function (msgObj) {
            _this.DDPConnectedStatus = true;
            _this.keyValueStore.set("DDPSessionId", msgObj.session);
            _this.connectedDDP();
        });
    }
    DDPClient.prototype.connected = function () {
        this.socketConnectedStatus = true;
        var connectRequest = {
            msg: "connect",
            support: this.supportedDDPVersions,
            version: this.ddpVersion
        };
        if (this.keyValueStore.has("DDPSessionId")) {
            connectRequest.session = this.keyValueStore.get("DDPSessionId");
        }
        this.sendMessageCallback(EJSON.stringify(connectRequest));
    };
    DDPClient.prototype.connectedDDP = function () {
        var _this = this;
        if (this.keyValueStore.has("LoginToken")) {
            var accounts = accounts_1.Accounts.instance;
            accounts.loginWithToken(this.keyValueStore.get("LoginToken"), function () {
                _this.reauthAttemptedStatus = true;
                _this.dispatchCallStack();
            });
        }
        else {
            this.reauthAttemptedStatus = true;
            this.dispatchCallStack();
        }
    };
    DDPClient.prototype.dispatchCallStack = function () {
        var _this = this;
        this.callStack.forEach(function (msgObj) {
            _this.send(msgObj);
        });
    };
    DDPClient.prototype.send = function (msgObj) {
        if ((this.socketConnectedStatus && msgObj.msg === "connect")
            || (this.DDPConnectedStatus && msgObj.msg === "method" && msgObj.method === "login")
            || this.reauthAttemptedStatus) {
            this.sendMessageCallback(EJSON.stringify(msgObj));
            return models_1.MessageSendStatus.sent;
        }
        else {
            this.callStack.push(msgObj);
            return models_1.MessageSendStatus.deferred;
        }
    };
    DDPClient.instance = new DDPClient();
    return DDPClient;
}());
exports.DDPClient = DDPClient;
