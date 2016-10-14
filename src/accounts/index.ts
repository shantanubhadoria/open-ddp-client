import { DDPClient } from "../ddp-client";
import { IDDPClient, IDDPErrorObject } from "../ddp-client/models";
import { Methods } from "../methods";
import { SHA256 } from "../sha256";
import { IDDPLoginResultObject } from "./models";
import * as EJSON from "ejson";

export class Accounts {
  public static instance: Accounts = new Accounts(); // Singleton

  public ddpClient: IDDPClient;
  public methodsObject: Methods;

  constructor(ddpClient?: IDDPClient, methodsObject?: Methods) {
    // Useful for mocking during tests
    if (ddpClient) {
      this.ddpClient = ddpClient;
    } else {
      this.ddpClient = DDPClient.instance;
    }
    if (methodsObject) {
      this.methodsObject = methodsObject;
    } else {
      this.methodsObject = Methods.instance;
    }
  }

  public login(
    params: any[],
    resultCallback?: Function,
    updatedCallback?: Function
  ): string {
    return this.methodsObject.call("login", params, (result: IDDPLoginResultObject, error: IDDPErrorObject) => {
      this.ddpClient.keyValueStore.set("loginToken", result.token);
      this.ddpClient.keyValueStore.set("loginTokenExpires", EJSON.stringify(result.tokenExpires));
      resultCallback(result, error);
    }, () => {
      updatedCallback();
    });
  }

  public loginWithToken(
    token: string,
    resultCallback?: Function,
    updatedCallback?: Function
  ): string {
    return this.login(
      [
        {
          resume: token,
        },
      ],
      resultCallback,
      updatedCallback,
    );
  }

  public loginWithPassword(
    selector: string,
    password: string,
    resultCallback?: Function,
    updatedCallback?: Function
  ): string {
    let identifier = {};

    if (selector.indexOf("@") === -1) {
      identifier = {username: selector};
    } else {
      identifier = {email: selector};
    }
    return this.login(
      [
        {
          password: this.hashPassword(password),
          user: identifier,
        },
      ],
      resultCallback,
      updatedCallback,
    );
  }

  private hashPassword(password: string) {
    let sha256Object = ""; // new SHA256(password);
    return {
      algorithm: "sha-256",
      digest: sha256Object.toString(),
    };
  }
}
