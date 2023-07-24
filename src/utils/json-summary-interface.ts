export interface JSONSummary {
  total: FullCoverage;
  [file: string]: FullCoverage;
}

export interface FullCoverage {
  lines: CoverageObject;
  statements: CoverageObject;
  functions: CoverageObject;
  branches: CoverageObject;
}

export interface CoverageObject {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export interface JSONSummaryAggregation {
  total: FullCoverageAggregation;
  [file: string]: FullCoverageAggregation;
}

interface FullCoverageAggregation {
  lines: CoverageObjectAggregation;
  statements: CoverageObjectAggregation;
  functions: CoverageObjectAggregation;
  branches: CoverageObjectAggregation;
}

interface CoverageObjectAggregation {
  total: number[];
  covered: number[];
  skipped: number[];
  pct: number[];
}
