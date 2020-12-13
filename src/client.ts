import { server, ServerOperations } from "./server";
import { session, SessionOperations } from "./session";
import { db, DbOperations } from "./db";
import { users, UsersOperations } from "./user";

export type Relax = ServerOperations &
  SessionOperations &
  DbOperations &
  UsersOperations;

export interface Client {
  (options: {
    endpoint: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  }): Relax;
}

export const client: Client = ({
  endpoint,
  username,
  password,
  ssl = false,
}) => {
  const scheme = ssl ? "https://" : "http://";
  const publicUri = scheme + endpoint;
  const privateUri =
    username && password
      ? scheme + username + ":" + password + "@" + endpoint
      : publicUri;
  return {
    ...server(privateUri),
    users: users(privateUri),
    session: session(privateUri),
    db: db(privateUri),
  };
};
