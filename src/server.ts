import { AllDbOptions, DbInfo, DbInfoOptions } from "./db";
import { DocId } from "./internal";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import { get, Get, post, Post, request } from "./request";

export interface ServerOperations {
  read: Get;
  uuid(count?: number): Promise<Array<DocId>>;
  replicate: Post;
  activeTasks: Get;
  allDbs: Get;
  dbsInfo: Post;
}

// users(): DocManager<User>;
// session(): Omit<Manager<Doc<UserContext>>, "update">;
// db<T = any>(name: string): DbManager<T>;

export const server = (uri: string) => ({
  read: () => get(uri, {}),
  activeTasks: () => get<Array<ActiveTask>>(`${uri}/_active_tasks`, {}),
  allDbs: (options?: AllDbOptions) =>
    get<Array<string>, AllDbOptions>(`${uri}/_all_dbs`, options!),
  dbsInfo: (options?: DbInfoOptions) =>
    post<Array<DbInfo>, DbInfoOptions>(`${uri}/_dbs_info`, options!),
  uuid: (count = 1) =>
    request(`${uri}/_uuids?count=${count}`, {
      method: "GET",
    }).then((res) => res.uuids),
  replicate: (options?: ReplicateOptions) =>
    post<Array<Replication>, ReplicateOptions>(`${uri}/_replicate`, options!),
});
