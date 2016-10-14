"use strict";
var SHA256 = (function () {
    function SHA256(plainText) {
        this.chrsz = 8;
        this.hexCase = 0;
        plainText = this.__Utf8Encode(plainText);
        this.hash = this.__binb2hex(this.__core_sha256(this.__str2binb(plainText), plainText.length * this.chrsz));
    }
    SHA256.prototype.toString = function () {
        return this.hash;
    };
    SHA256.prototype.__safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };
    SHA256.prototype.__S = function (X, n) {
        return (X >>> n) | (X << (32 - n));
    };
    SHA256.prototype.__R = function (X, n) {
        return (X >>> n);
    };
    SHA256.prototype.__Ch = function (x, y, z) {
        return ((x & y) ^ ((~x) & z));
    };
    SHA256.prototype.__Maj = function (x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
    };
    SHA256.prototype.__Sigma0256 = function (x) {
        return (this.__S(x, 2) ^ this.__S(x, 13) ^ this.__S(x, 22));
    };
    SHA256.prototype.__Sigma1256 = function (x) {
        return (this.__S(x, 6) ^ this.__S(x, 11) ^ this.__S(x, 25));
    };
    SHA256.prototype.__Gamma0256 = function (x) {
        return (this.__S(x, 7) ^ this.__S(x, 18) ^ this.__R(x, 3));
    };
    SHA256.prototype.__Gamma1256 = function (x) {
        return (this.__S(x, 17) ^ this.__S(x, 19) ^ this.__R(x, 10));
    };
    SHA256.prototype.__core_sha256 = function (m, l) {
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
        var W = new Array(64);
        var a;
        var b;
        var c;
        var d;
        var e;
        var f;
        var g;
        var h;
        var T1;
        var T2;
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
            for (var j = 0; j < 64; j++) {
                if (j < 16) {
                    W[j] = m[j + i];
                }
                else {
                    W[j] = this.__safe_add(this.__safe_add(this.__safe_add(this.__Gamma1256(W[j - 2]), W[j - 7]), this.__Gamma0256(W[j - 15])), W[j - 16]);
                }
                T1 = this.__safe_add(this.__safe_add(this.__safe_add(this.__safe_add(h, this.__Sigma1256(e)), this.__Ch(e, f, g)), K[j]), W[j]);
                T2 = this.__safe_add(this.__Sigma0256(a), this.__Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = this.__safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = this.__safe_add(T1, T2);
            }
            HASH[0] = this.__safe_add(a, HASH[0]);
            HASH[1] = this.__safe_add(b, HASH[1]);
            HASH[2] = this.__safe_add(c, HASH[2]);
            HASH[3] = this.__safe_add(d, HASH[3]);
            HASH[4] = this.__safe_add(e, HASH[4]);
            HASH[5] = this.__safe_add(f, HASH[5]);
            HASH[6] = this.__safe_add(g, HASH[6]);
            HASH[7] = this.__safe_add(h, HASH[7]);
        }
        return HASH;
    };
    SHA256.prototype.__str2binb = function (str) {
        var bin = Array();
        var mask = (1 << this.chrsz) - 1;
        for (var i = 0; i < str.length * this.chrsz; i += this.chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / this.chrsz) & mask) << (24 - i % 32);
        }
        return bin;
    };
    SHA256.prototype.__Utf8Encode = function (str) {
        var utftext = "";
        for (var n = 0; n < str.length; n++) {
            var c = str.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    SHA256.prototype.__binb2hex = function (binarray) {
        var hexTab = this.hexCase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    };
    return SHA256;
}());
exports.SHA256 = SHA256;
