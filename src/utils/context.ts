import { injectable, singleton } from "tsyringe";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as io from "@actions/io";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nanoid } from "nanoid";

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

  async getTmpDirectory(): Promise<string> {
    const tmpDirectory = tmpdir();
    const id = nanoid();
    const dirPath = join(tmpDirectory, id);
    await io.mkdirP(dirPath);
    return dirPath;
  }
}
