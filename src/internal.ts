import { DbInfo } from "./db";
import { RequestMethod } from "./request";
import { Roles } from "./user";

export interface UuidOptions {
  query: {
    count?: number;
  };
}

export interface SecurityObject {
  admins: {
    names: Array<string>;
    roles: Array<string>;
  };
  members: {
    names: Array<string>;
    roles: Array<string>;
  };
}

export interface UserContextObject {
  db: string;
  name: string;
  roles: Roles;
}

export interface InternalRequestObject {
  body: string;
  cookie: any;
  form: FormData;
  headers: Headers;
  id: DocId | null;
  info: DbInfo;
  method: RequestMethod;
  path: Array<string>;
  peer: string;
  query: Record<string, any>;
  raw_path: string;
  requested_path: Array<string>;
  secObj: SecurityObject;
  userCtx: UserContextObject;
  uuid: string;
}

export type Empty = any | null;

export type DocId = string;

export type DocIdFunc<T> = (doc: T) => string;

export const idFromDoc = <T>(
  doc: T,
  id?: DocId | DocIdFunc<T>
): DocId | undefined => {
  return typeof id === "function" ? id(doc) : id;
};
