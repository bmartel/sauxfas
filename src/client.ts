import { server, ServerOperations } from './server';
import { session, SessionOperations } from './session';
import { db, DbOperations } from './db';
import { users, UsersOperations } from './user';

export type Relax = ServerOperations &
  SessionOperations &
  DbOperations &
  UsersOperations;

export type Sdk = (admin?: boolean) => Relax;

export interface Client {
  (options: {
    endpoint: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  }): Sdk;
}

export const client: Client = ({
  endpoint,
  username,
  password,
  ssl = false,
}) => {
  const scheme = ssl ? 'https://' : 'http://';
  const publicUri = scheme + endpoint;
  const privateUri =
    username && password
      ? scheme + username + ':' + password + '@' + endpoint
      : publicUri;
  const sdk = (uri: string) => ({
    ...server(uri),
    users: users(uri),
    session: session(uri),
    db: db(uri),
  });

  return (admin?: boolean) => sdk(admin ? privateUri : publicUri);
};
