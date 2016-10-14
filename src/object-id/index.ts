import { Random } from "../random";

export class ObjectId {
  public static looksLikeObjectId(str: string): boolean {
    return !!(str.length === 24 && str.match(/^[0-9a-f]*$/));
  }

  public static selectorIsId(selector: any): boolean {
    return (typeof selector === "string") ||
      (typeof selector === "number") ||
      selector instanceof ObjectId;
  }

  private str: string;

  constructor(hexString?: string) {
    if (hexString) {
      hexString = hexString.toLowerCase();
      if (!ObjectId.looksLikeObjectId(hexString)) {
        throw new Error("Invalid hexadecimal string for creating an ObjectID");
      }
      this.str = hexString;
    } else {
      this.str = Random.hexString(24);
    }
  }

  public toString(): string {
    return "ObjectID(\"" + this.str + "\")";
  };

  public toHexString(): string {
    return this.str;
  }

  public equals(other: ObjectId): boolean {
    return other.toHexString() === this.str;
  }

  public clone(): ObjectId {
    return new ObjectId();
  }

  public idParse(id: any): any {
    if (id === "") {
      return id;
    } else if (id === "-") {
      return undefined;
    } else if (id.substr(0, 1) === "-") {
      return id.substr(1);
    } else if (id.substr(0, 1) === "~") {
      return JSON.parse(id.substr(1));
    } else if (ObjectId.looksLikeObjectId(id)) {
      return new ObjectId(id);
    } else {
      return id;
    }
  }
}
