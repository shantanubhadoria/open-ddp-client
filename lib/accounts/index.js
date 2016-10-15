"use strict";
var ddp_client_1 = require("../ddp-client");
var methods_1 = require("../methods");
var sha256_1 = require("../sha256");
var EJSON = require("ejson");
var Accounts = (function () {
    function Accounts(ddpClient, methodsObject) {
        if (ddpClient) {
            this.ddpClient = ddpClient;
        }
        else {
            this.ddpClient = ddp_client_1.DDPClient.instance;
        }
        if (methodsObject) {
            this.methodsObject = methodsObject;
        }
        else {
            this.methodsObject = methods_1.Methods.instance;
        }
    }
    Accounts.prototype.login = function (params, resultCallback, updatedCallback, methodName) {
        var _this = this;
        if (methodName === void 0) { methodName = "login"; }
        return this.methodsObject.call(methodName, params, function (result, error) {
            _this.ddpClient.keyValueStore.set("loginToken", result.token);
            _this.ddpClient.keyValueStore.set("loginTokenExpires", EJSON.stringify(result.tokenExpires));
            if (resultCallback) {
                resultCallback(result, error);
            }
        }, function () {
            if (updatedCallback) {
                updatedCallback();
            }
        });
    };
    Accounts.prototype.loginWithToken = function (token, resultCallback, updatedCallback) {
        return this.login([
            {
                resume: token
            },
        ], resultCallback, updatedCallback);
    };
    Accounts.prototype.loginWithPassword = function (selector, password, resultCallback, updatedCallback) {
        var identifier = {};
        if (selector.indexOf("@") === -1) {
            identifier = { username: selector };
        }
        else {
            identifier = { email: selector };
        }
        return this.login([
            {
                password: this.hashPassword(password),
                user: identifier
            },
        ], resultCallback, updatedCallback);
    };
    Accounts.prototype.requestPhoneVerification = function (phone, resultCallback, updatedCallback) {
        return this.methodsObject.call("requestPhoneVerification", [phone], resultCallback, updatedCallback);
    };
    Accounts.prototype.verifyPhone = function (phone, token, resultCallback, updatedCallback) {
        this.login([
            phone,
            token,
            null,
        ], resultCallback, updatedCallback, "verifyPhone");
    };
    Accounts.prototype.hashPassword = function (password) {
        var sha256Object = new sha256_1.SHA256(password);
        return {
            algorithm: "sha-256",
            digest: sha256Object.toString()
        };
    };
    Accounts.instance = new Accounts();
    return Accounts;
}());
exports.Accounts = Accounts;
