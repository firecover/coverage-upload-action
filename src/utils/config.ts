import { injectable, singleton } from "tsyringe";
import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { join } from "node:path";
import { cwd } from "node:process";

export const defaultConfig: FirecoverYML = {
  components: [{ componentId: "default", name: "default", paths: ["**"] }],
};

@injectable()
@singleton()
export class Config {
  getSignedRequestEndpoint(): string {
    return "todo";
  }

  async getRepoFirecoverYmlSettings(): Promise<FirecoverYML> {
    try {
      const firecoverYml = await readFile(join(cwd(), "./firecover.yml"));
      const firecoverConfig = YAML.parse(firecoverYml.toString()) || {};
      return { ...defaultConfig, ...firecoverConfig };
    } catch {
      return defaultConfig;
    }
  }

  async getComponentList(): Promise<FirecoverYML["components"]> {
    const settings = await this.getRepoFirecoverYmlSettings();
    return settings.components;
  }
}

export interface FirecoverYML {
  components: { componentId: string; name: string; paths: string[] }[];
}
