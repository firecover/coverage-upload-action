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
