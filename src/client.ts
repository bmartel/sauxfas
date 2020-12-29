import { server, ServerOperations } from './server';
import { session, SessionOperations } from './session';
import { db, DbOperations } from './db';
import { users, UsersOperations } from './user';
import { AuthCredentials } from './auth';

export type Relax = ServerOperations &
  SessionOperations &
  DbOperations &
  UsersOperations;

export type Sdk = (adminOrToken?: boolean) => Relax;

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
  const sdk = (uri: string, auth?: AuthCredentials) => ({
    ...server(uri, auth),
    users: users(uri, auth),
    session: session(uri, auth),
    db: db(uri, auth),
  });

  return (adminOrToken?: boolean | string) =>
    sdk(
      publicUri,
      adminOrToken
        ? typeof adminOrToken === 'boolean'
          ? { username: username!, password: password! }
          : { token: adminOrToken }
        : undefined,
    );
};
