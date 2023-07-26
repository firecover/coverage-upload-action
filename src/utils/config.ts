import { injectable, singleton } from "tsyringe";
import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { join } from "node:path";
import { cwd } from "node:process";
import { Logger } from "./logger";

export const defaultConfig: FirecoverYML = {
  components: [{ componentId: "default", name: "default", paths: ["**"] }],
};

@injectable()
@singleton()
export class Config {
  constructor(private readonly logger: Logger) {}

  getSignedRequestEndpoint(): string {
    this.logger.debug(`[config/getSignedRequestEndpoint] => todo`);
    return "todo";
  }

  async getRepoFirecoverYmlSettings(): Promise<FirecoverYML> {
    try {
      const configFileLocation = join(cwd(), "./firecover.yml");
      this.logger.debug(
        `[config/getRepoFirecoverYmlSettings] looking for ${configFileLocation}`
      );
      const firecoverYml = await readFile(configFileLocation);
      this.logger.debug(
        `[config/getRepoFirecoverYmlSettings] found ${configFileLocation}, yaml parsing...`
      );
      const firecoverConfig = YAML.parse(firecoverYml.toString()) || {};
      this.logger.debug(
        `[config/getRepoFirecoverYmlSettings] found ${configFileLocation}, yaml parsing...`
      );
      const mergedConfig = { ...defaultConfig, ...firecoverConfig };
      this.logger.debug(
        `[config/getRepoFirecoverYmlSettings] mergedConfig ${JSON.stringify(
          mergedConfig
        )}`
      );
      return mergedConfig;
    } catch {
      return defaultConfig;
    }
  }

  async getComponentList(): Promise<FirecoverYML["components"]> {
    const settings = await this.getRepoFirecoverYmlSettings();
    const components = settings.components;
    this.logger.debug(
      `[config/getComponentList] components identified: ${JSON.stringify(
        components
      )}`
    );
    return components;
  }
}

export interface FirecoverYML {
  components: { componentId: string; name: string; paths: string[] }[];
}
