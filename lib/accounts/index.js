"use strict";
var ddp_client_1 = require("../ddp-client");
var methods_1 = require("../methods");
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
    Accounts.prototype.login = function (params, resultCallback, updatedCallback) {
        var _this = this;
        return this.methodsObject.call("login", params, function (result, error) {
            _this.ddpClient.keyValueStore.set("loginToken", result.token);
            _this.ddpClient.keyValueStore.set("loginTokenExpires", EJSON.stringify(result.tokenExpires));
            resultCallback(result, error);
        }, function () {
            updatedCallback();
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
    Accounts.prototype.hashPassword = function (password) {
        var sha256Object = "";
        return {
            algorithm: "sha-256",
            digest: sha256Object.toString()
        };
    };
    Accounts.instance = new Accounts();
    return Accounts;
}());
exports.Accounts = Accounts;
