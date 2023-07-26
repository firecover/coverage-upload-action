import { injectable, singleton } from "tsyringe";
import { Context } from "./context";
import { Config } from "./config";
import { Logger } from "./logger";
import { readFile } from "node:fs/promises";
import fetch from "node-fetch";

@injectable()
@singleton()
export class FileUploader {
  private signedRequestEndpoint: string;

  constructor(
    private readonly context: Context,
    private readonly logger: Logger,
    config: Config,
  ) {
    this.signedRequestEndpoint = config.getSignedRequestEndpoint();
  }

  async uploadFile(filePathToUpload: string): Promise<void> {
    const signedUploadUrl = await this.getSignedUrl();
    await this.uploadFileWithSignedUrl({ filePathToUpload, signedUploadUrl });
  }

  private async uploadFileWithSignedUrl({
    filePathToUpload,
    signedUploadUrl,
  }: {
    filePathToUpload: string;
    signedUploadUrl: string;
  }): Promise<void> {
    const file = await readFile(filePathToUpload);
    await fetch(signedUploadUrl, { body: file, method: "put" });
  }

  private async getSignedUrl(): Promise<string> {
    const [ref, token] = await Promise.all([
      this.context.getRef(),
      this.context.getToken(),
    ]);

    const body = JSON.stringify({
      token,
      ref,
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
      this.logger.log(JSON.stringify(signedResponse));
      throw error;
    }

    const responseData = (await signedResponse.json()) as { url: string };
    return responseData.url;
  }
}
