import { AuthCredentials } from './auth';
import { Doc } from './doc';
import { Manager } from './manager';
import { resource } from './resource';
import { UserContext } from './user';

export interface SessionOperations {
  session(): Omit<Manager<Doc<UserContext>>, 'update'>;
}

export const session = (uri: string, auth?: AuthCredentials) => () =>
  resource(`${uri}/_session`, auth);
