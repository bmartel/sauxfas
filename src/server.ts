import { ClusterSetupOptions, ClusterSetupStatusOptions } from "./cluster";
import { AllDbOptions, DbInfo, DbInfoOptions } from "./db";
import { DocId } from "./internal";
import { Manager } from "./manager";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import { get, Get, post, Post, request } from "./request";
import { resource } from "./resource";

export interface ServerOperations {
  read: Get;
  uuid(count?: number): Promise<Array<DocId>>;
  replicate: Post;
  activeTasks: Get;
  allDbs: Get;
  dbsInfo: Post;
  clusterSetup: () => Pick<Manager<any>, "read" | "create">;
}

export const server = (uri: string): ServerOperations => ({
  read: () => get(uri, {}),
  activeTasks: () => get<Array<ActiveTask>>(`${uri}/_active_tasks`, {}),
  allDbs: (options?: AllDbOptions) =>
    get<Array<string>, AllDbOptions>(`${uri}/_all_dbs`, options!),
  clusterSetup: () => {
    const { read, create } = resource(`${uri}/_cluster_setup`);
    return {
      read: (options?: ClusterSetupStatusOptions) => read(options),
      create: (options: ClusterSetupOptions) => create(options),
    };
  },
  dbsInfo: (options?: DbInfoOptions) =>
    post<Array<DbInfo>, DbInfoOptions>(`${uri}/_dbs_info`, options!),
  uuid: (count = 1) =>
    request(`${uri}/_uuids?count=${count}`, {
      method: "GET",
    }).then((res) => res.uuids),
  replicate: (options?: ReplicateOptions) =>
    post<Array<Replication>, ReplicateOptions>(`${uri}/_replicate`, options!),
});
