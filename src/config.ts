import { injectable, singleton } from "tsyringe";

@injectable()
@singleton()
export class Config {
  getSignedRequestEndpoint(): string {
    return "url";
  }
}
