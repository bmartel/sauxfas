export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

export type SortBy = Array<{ [k: string]: SortDirection }>;

export enum SelectorOperators {
  And = "$and",
  Or = "$or",
  Not = "$not",
  Nor = "$nor",
  All = "$all",
  ElementMatch = "$elemMatch",
  AllMatch = "$allMatch",
  KeyMapMatch = "$keyMapMatch",
}

export enum ConditionOperators {
  LessThan = "$lt",
  LessThanOrEqual = "$lte",
  Equal = "$eq",
  NotEqual = "$ne",
  GreaterThanOrEqual = "$gte",
  GreaterThan = "$gt",
  Exists = "$exists",
  Type = "$type",
  In = "$in",
  NotIn = "$nin",
  Size = "$size",
  Modulus = "$mod",
  Regex = "$regex",
}

export interface SelectorCondition {
  [ConditionOperators.LessThan]?: any;
  [ConditionOperators.LessThanOrEqual]?: any;
  [ConditionOperators.Equal]?: any;
  [ConditionOperators.NotEqual]?: any;
  [ConditionOperators.GreaterThanOrEqual]?: any;
  [ConditionOperators.GreaterThan]?: any;
  [ConditionOperators.Exists]?: any;
  [ConditionOperators.Type]?: any;
  [ConditionOperators.In]?: any;
  [ConditionOperators.NotIn]?: any;
  [ConditionOperators.Size]?: any;
  [ConditionOperators.Modulus]?: any;
  [ConditionOperators.Regex]?: any;
}

export type SelectorExpression = Record<string, SelectorCondition>;

export interface Selector {
  [SelectorOperators.And]?: SelectorExpression;
  [SelectorOperators.Or]?: SelectorExpression;
  [SelectorOperators.Not]?: SelectorExpression;
  [SelectorOperators.Nor]?: SelectorExpression;
  [SelectorOperators.All]?: SelectorExpression;
  [SelectorOperators.ElementMatch]?: SelectorExpression;
  [SelectorOperators.AllMatch]?: SelectorExpression;
  [SelectorOperators.KeyMapMatch]?: SelectorExpression;
  [k: string]: SelectorExpression | any;
}
