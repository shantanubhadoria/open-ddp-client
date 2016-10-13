export default class ObjectId {
    static looksLikeObjectId(str: string): boolean;
    static selectorIsId(selector: any): boolean;
    private str;
    constructor(hexString?: string);
    toString(): string;
    toHexString(): string;
    equals(other: ObjectId): boolean;
    clone(): ObjectId;
    idParse(id: any): any;
}
