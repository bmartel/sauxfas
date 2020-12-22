import { ClusterSetup, ClusterSetupOptions, ClusterSetupState, ClusterSetupStatusOptions } from "./cluster";
import {
  AllDbOptions,
  DbInfo,
  DbInfoOptions,
  DbUpdateOptions,
  DbUpdateResult,
} from "./db";
import { DocId, Empty, UuidOptions } from "./internal";
import { Manager } from "./manager";
import { NodeConfigUpdateOptions, NodeStatOptions } from "./node";
import { ActiveTask, ReplicateOptions, Replication } from "./replication";
import {
  appendPath,
  Destroy,
  get,
  Get,
  post,
  Post,
  Put,
  RequestMethod,
} from "./request";
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
  clusterSetup: () => {
    read: Get<ClusterSetupState, ClusterSetupStatusOptions>;
    create: Post<ClusterSetup>;
  };
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
  node: (
    name?: string
  ) => {
    read: Get;
    stats: Get;
    system: Get;
    config: () => {
      read: Get;
      reload: Post;
      section: (
        name: string
      ) => {
        read: Get;
        key: (
          name: string
        ) => {
          read: Get;
          update: Put;
          destroy: Destroy;
        };
      };
    };
  };
}

export const server = (uri: string): ServerOperations => ({
  read: () => get<any, Empty>(uri, {}),
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
      read: (options: ClusterSetupStatusOptions) => read(options),
      create: (options: ClusterSetupOptions) => create(options),
    };
  },
  membership: () => get<any, Empty>(`${uri}/_membership`, {}),
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
  up: () => get<{ status?: "ok" }, Empty>(`${uri}/_up`, {}),
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
  node: (name: string = "_local") => {
    const nodeUri = `${uri}/_node/${name}`;
    return {
      read: () => get<{ name: string }, Empty>(nodeUri, {}),
      stats: (options: NodeStatOptions) =>
        get<any, NodeStatOptions>(
          `${nodeUri}/_stats/${options.group}/${options.metric}`,
          options
        ),
      system: () => get<any, Empty>(`${nodeUri}/_system`, {}),
      config: () => {
        const configUri = `${nodeUri}/_config`;
        return {
          read: () => get<any, Empty>(configUri, {}),
          reload: () => post<any, Empty>(`${configUri}/_reload`, {}),
          section: (section: string) => {
            const sectionUri = `${configUri}/${section}`;
            return {
              read: () => get<any, Empty>(sectionUri, {}),
              key: (key: string) => {
                const { read, create: update, destroy } = resource(
                  `${sectionUri}/${key}`
                );
                return {
                  read,
                  update: (options: NodeConfigUpdateOptions) =>
                    update({ method: RequestMethod.Put, ...options }),
                  destroy,
                };
              },
            };
          },
        };
      },
    };
  },
});
