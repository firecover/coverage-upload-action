import { injectable, singleton } from "tsyringe";
import Zip from "adm-zip";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

@injectable()
@singleton()
export class Zipper {
  async zipFilesInDirectory(directoryPath: string): Promise<string> {
    const zip = new Zip();
    const targetFilePath = join(directoryPath, "compressed.zip");
    const fileNames = await readdir(directoryPath);

    await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = join(directoryPath, fileName);
        const fileData = await readFile(filePath);
        zip.addFile(fileName, fileData);
      }),
    );

    await zip.writeZipPromise(targetFilePath);
    return targetFilePath;
  }
}
