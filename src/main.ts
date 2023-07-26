import { container, injectable, singleton } from "tsyringe";
import { Logger } from "./utils/logger";
import { Config } from "./utils/config";
import { CoverageFinder } from "./utils/coverage-finder";
import { Zipper } from "./utils/zipper";
import { FileUploader } from "./utils/file-upload";

@injectable()
@singleton()
class Main {
  constructor(
    private readonly logger: Logger,
    private readonly config: Config,
    private readonly coverage: CoverageFinder,
    private readonly zipper: Zipper,
    private readonly uploader: FileUploader
  ) {}
  async run(): Promise<void> {
    // Step 1: List all components
    const components = await this.config.getComponentList();
    this.logger.log(`Components: \n * ${components.join("\n * ")}`);

    // Step 2: Write to file aggregated coverage
    const aggregatedCoverageDirectoryPath =
      await this.coverage.findCoverageOfAllComponentsAndWriteToFile(components);

    // Step 3: Zip files
    const zipFilePath = await this.zipper.zipFilesInDirectory(
      aggregatedCoverageDirectoryPath
    );

    // Step 4: Upload
    const uploadConfirmation = await this.uploader.uploadFile(zipFilePath);
    this.logger.log(`Upload confirmation: ${uploadConfirmation}`);
  }
}

const runner = container.resolve(Main);

runner.run();
