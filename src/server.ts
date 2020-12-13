import { ClusterSetupOptions, ClusterSetupStatusOptions } from "./cluster";
import {
  AllDbOptions,
  DbInfo,
  DbInfoOptions,
  DbUpdateOptions,
  DbUpdateResult,
} from "./db";
import { DocId, Empty, UuidOptions } from "./internal";
import { Manager } from "./manager";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import { appendPath, get, Get, post, Post, RequestMethod } from "./request";
import { idResource, resource } from "./resource";
import {
  SchedulerDocOptions,
  SchedulerDocResult,
  SchedulerJob,
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
  up: Get;
  reshard: () => {
    read: Get;
    state: () => Pick<Manager<any>, "read" | "update">;
    jobs: (
      id?: string
    ) => Omit<Manager<SchedulerJob>, "update"> & {
      state: () => Pick<Manager<any>, "read" | "update">;
    };
  };
}

export const server = (uri: string): ServerOperations => ({
  read: () => get<Empty>(uri, {}),
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
  membership: () => get<Empty>(`${uri}/_membership`, {}),
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
  up: () => get<Empty, { status?: "ok" }>(`${uri}/_up`, {}),
  reshard: () => {
    const reshardUri = `${uri}/_reshard`;
    return {
      read: () => get(reshardUri, {}),
      state: () => {
        const { read, create: update } = resource(`${reshardUri}/state`);

        return {
          read,
          update: (options) =>
            update({ method: RequestMethod.Put, ...options }),
        };
      },
      jobs: (id?: DocId) => {
        const { read, create, destroy } = idResource<SchedulerJob>(
          `${reshardUri}/jobs`,
          id
        );

        return {
          read,
          create: (options) =>
            create({ method: RequestMethod.Post, ...options }),
          destroy,
          state: () => {
            const { read, create: update } = resource(
              `${reshardUri}/jobs/${id}/state`
            );
            return {
              read,
              update: (options) =>
                update({ method: RequestMethod.Put, ...options }),
            };
          },
        };
      },
    };
  },
});
