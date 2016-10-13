"use strict";
var Random = (function () {
    function Random() {
    }
    Random.hexString = function (digits) {
        return Random.randomString(digits, "0123456789abcdef");
    };
    Random.randomString = function (charsCount, alphabet) {
        var digits = [];
        for (var i = 0; i < charsCount; i++) {
            digits[i] = Random.choice(alphabet);
        }
        return digits.join("");
    };
    Random.choice = function (arrayOrString) {
        var index = Math.floor(Math.random() * 100000000) % arrayOrString.length;
        if (typeof arrayOrString === "string") {
            return arrayOrString.substr(index, 1);
        }
        else {
            return arrayOrString[index];
        }
    };
    return Random;
}());
exports.Random = Random;
