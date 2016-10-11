"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var mocha_typescript_1 = require("mocha-typescript");
var ddp_client_1 = require('../packages/ddp-client');
var ddpClient = ddp_client_1.DDPClient.getInstance();
var TestDDPBasic = (function () {
    function TestDDPBasic() {
    }
    TestDDPBasic.prototype.checkOnConnect = function (done) {
        var receivedMessages = false;
        ddpClient.onMessageSend = function (message) {
            console.log('message');
            receivedMessages = true;
        };
        setTimeout(function () {
            if (receivedMessages) {
                var error = new Error("Assert failed");
                error.expected = "expecteds";
                error.actual = "to faill";
                throw error;
            }
            else {
                done();
            }
        }, 100);
        ddpClient.onConnect();
    };
    __decorate([
        mocha_typescript_1.test, 
        __metadata('design:type', Object)
    ], TestDDPBasic.prototype, "check ", void 0);
    TestDDPBasic = __decorate([
        mocha_typescript_1.suite("ddp basic tests"), 
        __metadata('design:paramtypes', [])
    ], TestDDPBasic);
    return TestDDPBasic;
}());
