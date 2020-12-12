import { AllDbOptions, DbInfo, DbInfoOptions, DbManager } from "./db";
import { doc, Doc, DocId, DocManager } from "./doc";
import { Manager } from "./manager";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import { get, Get, post, Post, request } from "./request";
import { resource } from "./resource";
import { User, UserContext } from "./user";
import { DesignDoc } from "./view";

export interface Sofa {
  read: Get;
  uuid(count?: number): Promise<Array<DocId>>;
  users(): DocManager<User>;
  session(): Omit<Manager<Doc<UserContext>>, "update">;
  db<T = any>(name: string): DbManager<T>;
  replicate: Post;
  activeTasks: Get;
  allDbs: Get;
  dbsInfo: Post;
}

export interface SofaClient {
  (options: {
    endpoint: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  }): Sofa;
}

export const client: SofaClient = ({
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
    read: () => get(privateUri, {}),
    uuid: (count = 1) =>
      request(`${privateUri}/_uuids?count=${count}`, {
        method: "GET",
      }).then((res) => res.uuids),
    users: () =>
      doc<User>(`${privateUri}/_users`)((d) => "org.couchdb.user:" + d.name),
    session: () => resource(`${privateUri}/_session`),
    db: (name: string) => {
      const dbUri = `${privateUri}/${name}`;
      const { read, create, destroy } = resource(dbUri);
      return {
        read,
        create: (options) => create({ ...options, method: "PUT" }),
        destroy,
        allDocs: (options = {}) => get(`${dbUri}/_all_docs`, options),
        designDocs: (options = {}) => get(`${dbUri}/_design_docs`, options),
        find: (options: any = {}) => post(`${dbUri}/_find`, options),
        index: () => resource(`${dbUri}/_index`),
        doc: doc(dbUri),
        designDoc: doc<DesignDoc>(`${dbUri}/_design`),
      };
    },
    activeTasks: () =>
      get<Array<ActiveTask>>(`${privateUri}/_active_tasks`, {}),
    allDbs: (options?: AllDbOptions) =>
      get<Array<string>, AllDbOptions>(`${privateUri}/_all_dbs`, options!),
    dbsInfo: (options?: DbInfoOptions) =>
      post<Array<DbInfo>, DbInfoOptions>(`${privateUri}/_dbs_info`, options!),
    replicate: (options?: ReplicateOptions) =>
      post<Array<Replication>, ReplicateOptions>(
        `${privateUri}/_replicate`,
        options!
      ),
  };
};
