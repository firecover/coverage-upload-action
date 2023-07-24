import { injectable, singleton } from "tsyringe";
import * as core from "@actions/core";

@injectable()
@singleton()
export class Logger {
  log = core.info;
  error = core.error;
  debug = core.debug;
}
