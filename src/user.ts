import { doc, Doc, DocManager } from "./doc";

export type Roles = Array<string>;

export type User = Doc<{
  name: string;
  roles: Roles;
  type: "user";
  password: string;
}>;

export interface UserContext {
  userCtx: Omit<User, "password">;
}

export interface UsersOperations {
  users(): DocManager<User>;
}

export const users = (uri: string) => () =>
  doc<User>(`${uri}/_users`)((d) => "org.couchdb.user:" + d.name);
