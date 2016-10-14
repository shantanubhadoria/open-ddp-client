"use strict";
var random_1 = require("../random");
var ObjectId = (function () {
    function ObjectId(hexString) {
        if (hexString) {
            hexString = hexString.toLowerCase();
            if (!ObjectId.looksLikeObjectId(hexString)) {
                throw new Error("Invalid hexadecimal string for creating an ObjectID");
            }
            this.str = hexString;
        }
        else {
            this.str = random_1.Random.hexString(24);
        }
    }
    ObjectId.looksLikeObjectId = function (str) {
        return !!(str.length === 24 && str.match(/^[0-9a-f]*$/));
    };
    ObjectId.selectorIsId = function (selector) {
        return (typeof selector === "string") ||
            (typeof selector === "number") ||
            selector instanceof ObjectId;
    };
    ObjectId.prototype.toString = function () {
        return "ObjectID(\"" + this.str + "\")";
    };
    ;
    ObjectId.prototype.toHexString = function () {
        return this.str;
    };
    ObjectId.prototype.equals = function (other) {
        return other.toHexString() === this.str;
    };
    ObjectId.prototype.clone = function () {
        return new ObjectId();
    };
    ObjectId.prototype.idParse = function (id) {
        if (id === "") {
            return id;
        }
        else if (id === "-") {
            return undefined;
        }
        else if (id.substr(0, 1) === "-") {
            return id.substr(1);
        }
        else if (id.substr(0, 1) === "~") {
            return JSON.parse(id.substr(1));
        }
        else if (ObjectId.looksLikeObjectId(id)) {
            return new ObjectId(id);
        }
        else {
            return id;
        }
    };
    return ObjectId;
}());
exports.ObjectId = ObjectId;
