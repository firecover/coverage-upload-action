import { injectable, singleton } from "tsyringe";

@injectable()
@singleton()
export class Context {
  async getToken(): Promise<string> {
    return "token";
  }

  async getBranch(): Promise<string> {
    return "branch";
  }
}
