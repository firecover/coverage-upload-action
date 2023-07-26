import "reflect-metadata";
import { container } from "tsyringe";
import { Runner } from "./runner";

const runner = container.resolve(Runner);

runner.run();
