// Special file type to define types which are not defined in their respetive packages

export type ParsedAST = {
  type: string;
  value?: string;
  depth?: number;
  position: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
  children: Array<ParsedAST>;
};
