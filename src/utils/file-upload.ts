import { injectable, singleton } from "tsyringe";
import { Context } from "./context";
import { Config } from "./config";
import { Logger } from "./logger";
import { readFile } from "node:fs/promises";

@injectable()
@singleton()
export class FileUploader {
  private signedRequestEndpoint: string;

  constructor(
    private readonly context: Context,
    readonly config: Config,
    private readonly logger: Logger
  ) {
    this.signedRequestEndpoint = config.getSignedRequestEndpoint();
  }

  async uploadBlob({
    reporter,
    component,
    filePath,
  }: {
    component: string;
    reporter: "json-summary";
    filePath: string;
  }): Promise<void> {
    const signedUploadUrl = await this.getSignedUrlFor({ component, reporter });
    await this.uploadFileWithSignedUrl({ filePath, signedUploadUrl });
  }

  private async uploadFileWithSignedUrl({
    filePath,
    signedUploadUrl,
  }: {
    filePath: string;
    signedUploadUrl: string;
  }): Promise<void> {
    const file = await readFile(filePath);
    await fetch(signedUploadUrl, { body: file, method: "put" });
  }

  private async getSignedUrlFor({
    component,
    reporter,
  }: {
    component: string;
    reporter: "json-summary";
  }): Promise<string> {
    const [ref, token] = await Promise.all([
      this.context.getRef(),
      this.context.getToken(),
    ]);

    const body = JSON.stringify({
      token,
      ref,
      reporter,
      component,
    });

    const signedResponse = await fetch(this.signedRequestEndpoint, {
      body,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (signedResponse.status !== 200) {
      const error = new Error("Unable to get token");
      this.logger.error(error);
      this.logger.debug(JSON.stringify(signedResponse));
      throw error;
    }

    const tokenData = (await signedResponse.json()) as { token: string };
    return tokenData.token;
  }
}
