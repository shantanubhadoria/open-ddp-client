"use strict";
var DDPMessageType;
(function (DDPMessageType) {
    DDPMessageType[DDPMessageType["connect"] = 0] = "connect";
    DDPMessageType[DDPMessageType["message"] = 1] = "message";
})(DDPMessageType || (DDPMessageType = {}));
(function (MessageSendStatus) {
    MessageSendStatus[MessageSendStatus["sent"] = 0] = "sent";
    MessageSendStatus[MessageSendStatus["deferred"] = 1] = "deferred";
    MessageSendStatus[MessageSendStatus["failed"] = 2] = "failed";
})(exports.MessageSendStatus || (exports.MessageSendStatus = {}));
var MessageSendStatus = exports.MessageSendStatus;
