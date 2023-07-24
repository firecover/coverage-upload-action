/**
 * This file is not optimized for performance
 */

import { injectable, singleton } from "tsyringe";
import * as glob from "@actions/glob";
import { join } from "path";
import {
  CoverageObject,
  FullCoverage,
  JSONSummary,
  JSONSummaryAggregation,
} from "./json-summary-interface";
import { readFile } from "fs/promises";
import * as mathSum from "math-sum";
import { Logger } from "./logger";

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
export class CoverageAggregator {
  constructor(private readonly logger: Logger) {}

  async jsonSummary(globPatterns: string[]): Promise<JSONSummary> {
    const lookupFileName = "coverage-summary.json";
    const fullGlobPatterns = globPatterns.map((pattern) =>
      join(pattern, lookupFileName)
    );

    const filesRaw: string[][] = await Promise.all(
      fullGlobPatterns.map(async (pattern) => {
        const globs = await glob.create(pattern);
        const globSpecificFiles = await globs.glob();
        return globSpecificFiles;
      })
    );

    const files = filesRaw.flat();

    this.logger.debug(`files: \n${files.join("\n")}`);

    const allSummaries: JSONSummary[] = await Promise.all(
      files.map(async (file) => {
        const content = (await readFile(file)).toString();
        const jsonData = JSON.parse(content) as JSONSummary;
        return jsonData;
      })
    );

    const summaryAggregationArray: JSONSummaryAggregation = {
      total: {
        branches: { covered: [], pct: [], skipped: [], total: [] },
        functions: { covered: [], pct: [], skipped: [], total: [] },
        lines: { covered: [], pct: [], skipped: [], total: [] },
        statements: { covered: [], pct: [], skipped: [], total: [] },
      },
    };

    /**
     * This file is not optimized for performance
     */

    for (const summary of allSummaries)
      for (const fileName of Object.keys(summary))
        for (const coverageKey of fullCoverageObjectKeys)
          for (const coverageObjectKey of coverageObjectKeys)
            summaryAggregationArray[fileName][coverageKey][
              coverageObjectKey
            ].push(summary[fileName][coverageKey][coverageObjectKey]);

    const summaryAggregation: JSONSummary = {
      total: {
        branches: { covered: 0, pct: 0, skipped: 0, total: 0 },
        functions: { covered: 0, pct: 0, skipped: 0, total: 0 },
        lines: { covered: 0, pct: 0, skipped: 0, total: 0 },
        statements: { covered: 0, pct: 0, skipped: 0, total: 0 },
      },
    };

    for (const file of Object.keys(summaryAggregationArray))
      for (const coverageKey of fullCoverageObjectKeys)
        for (const coverageObjectKey of coverageObjectKeys)
          summaryAggregation[file][coverageKey][coverageObjectKey] = mathSum(
            summaryAggregationArray[file][coverageKey][coverageObjectKey]
          );

    return summaryAggregation;
  }
}
