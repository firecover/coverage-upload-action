import { injectable, singleton } from "tsyringe";
import * as core from "@actions/core";
import * as github from "@actions/github";

@injectable()
@singleton()
export class Context {
  private token?: string;

  async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }
    this.token = core.getInput("token");
    return this.token;
  }

  async getRef(): Promise<string> {
    return github.context.ref;
  }
}
