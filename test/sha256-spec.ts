/// <reference path="../typings/index.d.ts" />
import { SHA256 } from "../src";

import { expect } from "chai";
import "mocha";

describe("SHA256", () => {
  it("delivers accurate hash with a known sample", () => {
    var input = "shantanubhadoria";
    var hash = new SHA256(input);
    expect(hash.toString()).to.equal("047bdb8ec1ca1fbae3091e25857fdeb85340f93efe3e6ec2abe412e43db69cd2");
  });
});