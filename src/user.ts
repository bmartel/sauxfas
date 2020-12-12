import { Doc } from "./doc";

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
