import { injectable, singleton } from "tsyringe";
import { Config } from "./utils/config";
import { JSONSummary } from "./utils/json-summary-interface";
import {
  CoverageAggregator,
  coverageObjectKeys,
  fullCoverageObjectKeys,
} from "./utils/coverage-aggregator";

@injectable()
@singleton()
export class CoverageFinder {
  constructor(
    private readonly config: Config,
    private readonly coverageAggregator: CoverageAggregator
  ) {}

  async getCoverageSummaryOfAllComponents(): Promise<
    {
      componentId: string;
      name: string;
      paths: string[];
      jsonSummary: JSONSummary;
    }[]
  > {
    const components = await this.config.getComponentList();
    const findCoverageSummaryTask: Promise<{
      componentId: string;
      name: string;
      paths: string[];
      jsonSummary: JSONSummary;
    }>[] = components.map(async (component) => {
      const jsonSummary = await this.coverageAggregator.jsonSummary(
        component.paths
      );
      return { ...component, jsonSummary };
    });
    const summary = await Promise.all(findCoverageSummaryTask);
    return summary;
  }

  getTotalCoverageSummary(
    componentSummaryTotals: JSONSummary["total"][]
  ): JSONSummary["total"] {
    const result: JSONSummary["total"] = {
      branches: { covered: 0, pct: 0, skipped: 0, total: 0 },
      functions: { covered: 0, pct: 0, skipped: 0, total: 0 },
      lines: { covered: 0, pct: 0, skipped: 0, total: 0 },
      statements: { covered: 0, pct: 0, skipped: 0, total: 0 },
    };

    for (const componentTotal of componentSummaryTotals)
      for (const coverageKey of fullCoverageObjectKeys)
        for (const coverageObjectKey of coverageObjectKeys) {
          result[coverageKey][coverageObjectKey] +=
            componentTotal[coverageKey][coverageObjectKey];
        }

    return result;
  }
}
