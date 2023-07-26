/**
 * This file is not optimized for performance
 */

import { injectable, singleton } from "tsyringe";
import { Config, FirecoverYML } from "./config";
import * as glob from "@actions/glob";
import { join } from "path";
import {
  CoverageObject,
  FullCoverage,
  JSONSummary,
} from "./json-summary-interface";
import { readFile, writeFile } from "fs/promises";
import { Logger } from "./logger";
import { Context } from "./context";

export const coverageObjectKeys: (keyof CoverageObject)[] = [
  "covered",
  "pct",
  "skipped",
  "total",
];
export const fullCoverageObjectKeys: (keyof FullCoverage)[] = [
  "branches",
  "functions",
  "lines",
  "statements",
];

@injectable()
@singleton()
export class CoverageFinder {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly context: Context,
  ) {}

  async findCoverageOfAllComponentsAndWriteToFile(
    components: FirecoverYML["components"],
  ): Promise<string> {
    const coverageDir = await this.context.getTmpDirectory();
    const componentTotalCoverages = await Promise.all(
      components.map(async (component) => {
        const componentCoverage = await this.jsonSummaryOfComponent(component);
        await this.writeOut(
          coverageDir,
          component.componentId,
          componentCoverage,
        );
        return componentCoverage.total;
      }),
    );

    const projectFullCoverage: FullCoverage = {
      branches: { covered: 0, pct: 0, skipped: 0, total: 0 },
      functions: { covered: 0, pct: 0, skipped: 0, total: 0 },
      lines: { covered: 0, pct: 0, skipped: 0, total: 0 },
      statements: { covered: 0, pct: 0, skipped: 0, total: 0 },
    };

    for (const componentCoverage of componentTotalCoverages) {
      for (const type of Object.keys(
        componentCoverage,
      ) as unknown as (keyof FullCoverage)[]) {
        projectFullCoverage[type].covered += componentCoverage[type].covered;
        projectFullCoverage[type].skipped += componentCoverage[type].skipped;
        projectFullCoverage[type].total += componentCoverage[type].total;
        projectFullCoverage[type].pct =
          (projectFullCoverage[type].covered /
            projectFullCoverage[type].total) *
          100;
      }
    }

    await this.writeOut(coverageDir, "aggregated-coverage-summary", {
      total: projectFullCoverage,
    });

    return coverageDir;
  }

  private async writeOut(
    coverageDir: string,
    componentId: string,
    componentCoverage: JSONSummary,
  ): Promise<void> {
    const filePath = join(coverageDir, `${componentId}.json`);
    return writeFile(filePath, JSON.stringify(componentCoverage));
  }

  private async jsonSummaryOfComponent(
    component: FirecoverYML["components"][number],
  ): Promise<JSONSummary> {
    const searchGlobPatterns = component.paths;
    const lookupFileName = "coverage-summary.json";
    const fullGlobPatterns = searchGlobPatterns.map((pattern) =>
      join(pattern, lookupFileName),
    );

    const filesRaw: string[][] = await Promise.all(
      fullGlobPatterns.map(async (pattern) => {
        const globs = await glob.create(pattern);
        const globSpecificFiles = await globs.glob();
        return globSpecificFiles;
      }),
    );

    const files = filesRaw.flat();

    this.logger.log(`Found files: \n * ${files.join("\n * ")}`);

    const allSummaries: JSONSummary[] = await Promise.all(
      files.map(async (file) => {
        const content = (await readFile(file)).toString();
        const jsonData = JSON.parse(content) as JSONSummary;
        return jsonData;
      }),
    );

    const summaryAggregation: JSONSummary = {
      total: {
        branches: { covered: 0, pct: 0, skipped: 0, total: 0 },
        functions: { covered: 0, pct: 0, skipped: 0, total: 0 },
        lines: { covered: 0, pct: 0, skipped: 0, total: 0 },
        statements: { covered: 0, pct: 0, skipped: 0, total: 0 },
      },
    };

    for (const summary of allSummaries)
      for (const file of Object.keys(
        summary,
      ) as unknown as (keyof JSONSummary)[])
        for (const type of Object.keys(
          summary[file],
        ) as unknown as (keyof FullCoverage)[]) {
          this.logger.log(
            JSON.stringify({ file, type, summary, summaryAggregation }),
          );
          summaryAggregation[file][type].covered += summary[file][type].covered;
          summaryAggregation[file][type].skipped += summary[file][type].skipped;
          summaryAggregation[file][type].total += summary[file][type].total;
          summaryAggregation[file][type].pct =
            (summaryAggregation[file][type].covered /
              summaryAggregation[file][type].total) *
            100;
        }

    return summaryAggregation;
  }
}
