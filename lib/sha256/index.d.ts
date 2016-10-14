export declare class SHA256 {
    private chrsz;
    private hexCase;
    private hash;
    constructor(plainText: string);
    toString(): string;
    private __safe_add(x, y);
    private __S(X, n);
    private __R(X, n);
    private __Ch(x, y, z);
    private __Maj(x, y, z);
    private __Sigma0256(x);
    private __Sigma1256(x);
    private __Gamma0256(x);
    private __Gamma1256(x);
    private __core_sha256(m, l);
    private __str2binb(str);
    private __Utf8Encode(str);
    private __binb2hex(binarray);
}
