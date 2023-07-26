import { Runner } from "../src/runner";
import { describe, beforeEach, jest, it, expect } from "@jest/globals";
import { Config } from "../src/utils/config";
import { Logger } from "../src/utils/logger";
import { CoverageFinder } from "../src/utils/coverage-finder";
import { Zipper } from "../src/utils/zipper";
import { FileUploader } from "../src/utils/file-upload";

describe("Runner", () => {
  it("should list all components", async () => {
    const log = jest.fn() as any;
    const getComponentList = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    const findCoverageOfAllComponentsAndWriteToFile = jest.fn() as any;
    const zipFilesInDirectory = jest.fn() as any;
    const uploadFile = jest.fn() as any;

    const runner = new Runner(
      { log } as Logger,
      { getComponentList } as unknown as Config,
      { findCoverageOfAllComponentsAndWriteToFile } as CoverageFinder,
      { zipFilesInDirectory } as Zipper,
      { uploadFile } as FileUploader,
    );
    await runner.run();

    expect(log).toBeCalled();
    expect(getComponentList).toBeCalled();
    expect(findCoverageOfAllComponentsAndWriteToFile).toBeCalled();
    expect(zipFilesInDirectory).toBeCalled();
    expect(uploadFile).toBeCalled();
  });
});
