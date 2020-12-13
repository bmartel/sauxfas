import { ClusterSetupOptions, ClusterSetupStatusOptions } from "./cluster";
import {
  AllDbOptions,
  DbInfo,
  DbInfoOptions,
  DbUpdateOptions,
  DbUpdateResult,
} from "./db";
import { UuidOptions } from "./internal";
import { Manager } from "./manager";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import { appendPath, get, Get, post, Post } from "./request";
import { resource } from "./resource";
import {
  SchedulerDocOptions,
  SchedulerDocResult,
  SchedulerJobOptions,
  SchedulerJobResult,
} from "./scheduler";
import { SearchAnalyzeOptions, SearchAnalyzeResult } from "./search";

export interface ServerOperations {
  read: Get;
  uuids: Get;
  replicate: Post;
  activeTasks: Get;
  allDbs: Get;
  dbUpdates: Get;
  dbsInfo: Post;
  clusterSetup: () => Pick<Manager<any>, "read" | "create">;
  membership: Get;
  scheduler: () => {
    jobs: Get;
    docs: Get;
  };
  searchAnalyze: Post;
}

export const server = (uri: string): ServerOperations => ({
  read: () => get(uri, {}),
  uuids: (options?: UuidOptions) => get(`${uri}/_uuids`, options!),
  activeTasks: () => get<Array<ActiveTask>>(`${uri}/_active_tasks`, {}),
  allDbs: (options?: AllDbOptions) =>
    get<Array<string>, AllDbOptions>(`${uri}/_all_dbs`, options!),
  dbUpdates: (options?: DbUpdateOptions) =>
    get<DbUpdateResult, DbUpdateOptions>(`${uri}/_db_updates`, options!),
  dbsInfo: (options?: DbInfoOptions) =>
    post<Array<DbInfo>, DbInfoOptions>(`${uri}/_dbs_info`, options!),
  replicate: (options?: ReplicateOptions) =>
    post<Array<Replication>, ReplicateOptions>(`${uri}/_replicate`, options!),
  clusterSetup: () => {
    const { read, create } = resource(`${uri}/_cluster_setup`);
    return {
      read: (options?: ClusterSetupStatusOptions) => read(options),
      create: (options: ClusterSetupOptions) => create(options),
    };
  },
  membership: () => get(`${uri}/_membership`, {}),
  scheduler: () => {
    const schedulerUri = `${uri}/_scheduler`;
    return {
      jobs: (options?: SchedulerJobOptions) =>
        get<SchedulerJobResult, SchedulerJobOptions>(
          `${schedulerUri}/_jobs`,
          options!
        ),
      docs: (options?: SchedulerDocOptions) => {
        const { replicator, id, ...rest } = options || {};
        return get<SchedulerDocResult, SchedulerDocOptions>(
          appendPath(`${schedulerUri}/_docs`, [replicator, id]),
          rest!
        );
      },
    };
  },
  searchAnalyze: (options: SearchAnalyzeOptions) =>
    post<SearchAnalyzeResult, SearchAnalyzeOptions>(
      `${uri}/_search_analyze`,
      options
    ),
});
