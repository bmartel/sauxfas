export interface SearchAnalyzeOptions {
  data: {
    field: string;
    text: string;
  };
}

export interface SearchAnalyzeResult {
  tokens: Array<string>;
}
