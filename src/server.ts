import { AuthCredentials, withCredentials } from './auth';
import {
  ClusterSetup,
  ClusterSetupOptions,
  ClusterSetupState,
  ClusterSetupStatusOptions,
} from './cluster';
import {
  AllDbOptions,
  DbInfo,
  DbInfoOptions,
  DbUpdateOptions,
  DbUpdateResult,
} from './db';
import { DocId, Empty, UuidOptions } from './internal';
import { Manager } from './manager';
import { NodeConfigUpdateOptions, NodeStatOptions } from './node';
import { ActiveTask, ReplicateOptions, Replication } from './replication';
import {
  appendPath,
  Destroy,
  get,
  Get,
  post,
  Post,
  Put,
  RequestMethod,
} from './request';
import { idResource, resource } from './resource';
import {
  SchedulerDocOptions,
  SchedulerDocResult,
  SchedulerJob,
  SchedulerJobOptions,
  SchedulerJobResult,
} from './scheduler';
import { SearchAnalyzeOptions, SearchAnalyzeResult } from './search';

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
    state: () => Pick<Manager<any>, 'read' | 'update'>;
    jobs: (
      id?: string,
    ) => Omit<Manager<SchedulerJob>, 'update'> & {
      state: () => Pick<Manager<any>, 'read' | 'update'>;
    };
  };
  node: (
    name?: string,
  ) => {
    read: Get;
    stats: Get;
    system: Get;
    config: () => {
      read: Get;
      reload: Post;
      section: (
        name: string,
      ) => {
        read: Get;
        key: (
          name: string,
        ) => {
          read: Get;
          update: Put;
          destroy: Destroy;
        };
      };
    };
  };
}

export const server = (
  uri: string,
  auth?: AuthCredentials,
): ServerOperations => ({
  read: () => get<any, Empty>(uri, withCredentials({}, auth)),
  uuids: (options?: UuidOptions) =>
    get(`${uri}/_uuids`, withCredentials(options || {}, auth)),
  activeTasks: () =>
    get<Array<ActiveTask>>(`${uri}/_active_tasks`, withCredentials({}, auth)),
  allDbs: (options?: AllDbOptions) =>
    get<Array<string>, AllDbOptions>(
      `${uri}/_all_dbs`,
      withCredentials(options || {}, auth),
    ),
  dbUpdates: (options?: DbUpdateOptions) =>
    get<DbUpdateResult, DbUpdateOptions>(
      `${uri}/_db_updates`,
      withCredentials(options || {}, auth),
    ),
  dbsInfo: (options?: DbInfoOptions) =>
    post<Array<DbInfo>, DbInfoOptions>(
      `${uri}/_dbs_info`,
      withCredentials(options || {}, auth),
    ),
  replicate: (options?: ReplicateOptions) =>
    post<Array<Replication>, ReplicateOptions>(
      `${uri}/_replicate`,
      withCredentials(options || {}, auth),
    ),
  clusterSetup: () => {
    const { read, create } = resource(`${uri}/_cluster_setup`, auth);
    return {
      read: (options: ClusterSetupStatusOptions) => read(options),
      create: (options: ClusterSetupOptions) => create(options),
    };
  },
  membership: () =>
    get<any, Empty>(`${uri}/_membership`, withCredentials({}, auth)),
  scheduler: () => {
    const schedulerUri = `${uri}/_scheduler`;
    return {
      jobs: (options?: SchedulerJobOptions) =>
        get<SchedulerJobResult, SchedulerJobOptions>(
          `${schedulerUri}/_jobs`,
          withCredentials(options || {}, auth),
        ),
      docs: (options?: SchedulerDocOptions) => {
        const { replicator, id, ...rest } = options || {};
        return get<SchedulerDocResult, SchedulerDocOptions>(
          appendPath(`${schedulerUri}/_docs`, [replicator, id]),
          withCredentials(rest || {}, auth),
        );
      },
    };
  },
  searchAnalyze: (options: SearchAnalyzeOptions) =>
    post<SearchAnalyzeResult, SearchAnalyzeOptions>(
      `${uri}/_search_analyze`,
      withCredentials(options, auth),
    ),
  up: () =>
    get<{ status?: 'ok' }, Empty>(`${uri}/_up`, withCredentials({}, auth)),
  reshard: () => {
    const reshardUri = `${uri}/_reshard`;
    return {
      read: () => get(reshardUri, withCredentials({}, auth)),
      state: () => {
        const { read, create: update } = resource(`${reshardUri}/state`, auth);

        return {
          read,
          update: (options) =>
            update({ method: RequestMethod.Put, ...options }),
        };
      },
      jobs: (id?: DocId) => {
        const { read, create, destroy } = idResource<SchedulerJob>(
          `${reshardUri}/jobs`,
          auth,
          id,
        );

        return {
          read,
          create: (options) =>
            create({ method: RequestMethod.Post, ...options }),
          destroy,
          state: () => {
            const { read, create: update } = resource(
              `${reshardUri}/jobs/${id}/state`,
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
  node: (name: string = '_local') => {
    const nodeUri = `${uri}/_node/${name}`;
    return {
      read: () =>
        get<{ name: string }, Empty>(nodeUri, withCredentials({}, auth)),
      stats: (options: NodeStatOptions) =>
        get<any, NodeStatOptions>(
          `${nodeUri}/_stats/${options.group}/${options.metric}`,
          withCredentials(options, auth),
        ),
      system: () =>
        get<any, Empty>(`${nodeUri}/_system`, withCredentials({}, auth)),
      config: () => {
        const configUri = `${nodeUri}/_config`;
        return {
          read: () => get<any, Empty>(configUri, withCredentials({}, auth)),
          reload: () =>
            post<any, Empty>(`${configUri}/_reload`, withCredentials({}, auth)),
          section: (section: string) => {
            const sectionUri = `${configUri}/${section}`;
            return {
              read: () =>
                get<any, Empty>(sectionUri, withCredentials({}, auth)),
              key: (key: string) => {
                const { read, create: update, destroy } = resource(
                  `${sectionUri}/${key}`,
                  auth,
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
