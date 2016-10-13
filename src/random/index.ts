export class Random {
  public static hexString(digits: number) {
    return Random.randomString(digits, "0123456789abcdef");
  }

  public static randomString(charsCount: number, alphabet: string) {
    let digits: Array<string> = [];
    for (let i = 0; i < charsCount; i++) {
      digits[i] = Random.choice(alphabet);
    }
    return digits.join("");
  }

  public static choice(arrayOrString: Array<string> | string) {
    let index = Math.floor(Math.random() * 100000000) % arrayOrString.length;
    if (typeof arrayOrString === "string") {
      return arrayOrString.substr(index, 1);
    } else {
      return arrayOrString[index];
    }
  }
}
