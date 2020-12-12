import { Doc, DocId } from "./doc";
import { SecurityObject, UserContextObject } from "./internal";

export type ViewKey =
  | string
  | number
  | Array<any>
  | Record<string, any>
  | any
  | null;

export type ViewValue =
  | string
  | number
  | Array<any>
  | Record<string, any>
  | any
  | null;

export type ViewResult<K = ViewKey, V = ViewValue> = {
  offset: number;
  total_rows: number;
  rows: Array<{
    id: DocId;
    key: K;
    value: V;
  }>;
};

export type ValidateDocUpdate = <T = any>(
  newDoc: Doc<T>,
  oldDoc: Doc<T>,
  userCtx: UserContextObject,
  secObj: SecurityObject
) => any;

export type MapFunc = <T = any>(doc: Doc<T>) => any;
export type ReduceFunc = (
  key: any,
  values: Array<any>,
  rereduce?: boolean
) => any;

export interface ViewFuncs {
  [k: string]: {
    map?: MapFunc | string;
    reduce?: ReduceFunc | string;
  };
}

export interface DesignDoc {
  language: string;
  options: Record<string, any>;
  filters: Record<string, any>;
  updates: Record<string, any>;
  views: ViewFuncs;
  validate_doc_update: ValidateDocUpdate | string;
  autoupdate: boolean;
}
