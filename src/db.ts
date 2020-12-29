import { AuthCredentials, withCredentials } from './auth';
import { DesignDocOptions, doc, DocManager } from './doc';
import { DocId, MultipleQueryOptions } from './internal';
import { Manager } from './manager';
import { Selector, SortBy } from './query';
import {
  appendPath,
  Destroy,
  get,
  Get,
  Post,
  post,
  Put,
  request,
  RequestData,
  RequestMethod,
  RequestQuery,
} from './request';
import { resource } from './resource';
import { DesignDoc } from './view';

export enum DbFeed {
  Normal = 'normal',
  Longpoll = 'longpoll',
  Continuous = 'continuous',
  Eventsource = 'eventsource',
}
export enum DbEvent {
  Created = 'created',
  Updated = 'updated',
  Destroyed = 'deleted',
}

export interface DbCluster {
  q: number;
  n: number;
  w: number;
  r: number;
}
export interface DbSizes {
  file: number;
  external: number;
  active: number;
}

export interface Db {
  db_name: string;
  update_seq: string;
  sizes: DbSizes;
  purge_seq: number;
  doc_del_count: number;
  doc_count: number;
  disk_format_version: number;
  compact_running: boolean;
  cluster: DbCluster;
  instance_start_time: string;
}
export interface DbInfo {
  key: string;
  info: Db;
}

export type DbInfoOptions = RequestData<{
  keys: Array<string>;
}>;

export type AllDbOptions = RequestQuery<{
  descending?: boolean;
  endkey?: string;
  end_key?: string;
  limit?: number;
  skip?: number;
  startkey?: string;
  start_key?: string;
}>;

export type DbUpdateOptions = RequestQuery<{
  feed?: DbFeed;
  timeout?: number;
  heartbeat?: number;
  since?: string;
}>;

export interface DbUpdateResult {
  results: Array<{
    db_name: string;
    type: DbEvent;
    seq: string;
  }>;
  last_seq: string;
}

export type DbFindOptions = RequestData<{
  selector: Selector;
  limit?: number;
  skip?: number;
  sort: SortBy;
  fields?: Array<string>;
  use_index?: string | Array<string>;
  r?: number;
  bookmark?: string;
  update?: boolean;
  stable?: boolean;
  descending?: boolean;
  execution_stats?: boolean;
}>;

export type DbManager<T = Db> = Omit<Manager<T>, 'update'> & {
  doc<D = any>(id: DocId): DocManager<D>;
  designDoc<D = DesignDoc>(docid: DocId): Manager<D>;
  index(): {
    read: Get;
    create: Post;
    destroy: Destroy;
  };
  allDocs: () => {
    read: Get;
    queries: Post;
  };
  designDocs: () => {
    read: Get<Array<DesignDoc>, DesignDocOptions>;
    queries: Post;
  };
  bulkGet: Get;
  bulkDocs: Post;
  changes: Get;
  compact: Post;
  find: Post;
  explain: Post;
  shards: () => {
    read: Get;
    doc: (docId: string) => Get;
    sync: Post;
  };
  security(): {
    read: Get;
    update: Put;
  };
  purge: Post;
  purgedInfoLimit: () => {
    read: Get;
    update: Put;
  };
  revs: () => {
    missing: Post;
    diff: Post;
    limit: Get;
  };
  viewCleanup: Post;
};

export type DbResource<T = any> = (name: string) => DbManager<T>;

export interface DbOperations {
  db<T = any>(name: string): DbManager<T>;
}

export const db = <T = Db>(
  uri: string,
  auth?: AuthCredentials,
): DbResource<T> => (name: string) => {
  const dbUri = `${uri}/${name}`;
  const { read, create, destroy } = resource<T>(dbUri, auth);
  return {
    read,
    create: (options) => create({ ...options, method: RequestMethod.Put }),
    destroy,
    allDocs: () => {
      const allDocsUri = `${dbUri}/_all_docs`;
      return {
        read: (options = {}) => get(allDocsUri, withCredentials(options, auth)),
        queries: (options: MultipleQueryOptions) =>
          post<any, MultipleQueryOptions>(
            `${allDocsUri}/queries`,
            withCredentials(options, auth),
          ),
      };
    },
    designDocs: () => {
      const designDocsUri = `${dbUri}/_design_docs`;
      return {
        read: (options: DesignDocOptions) =>
          get<Array<DesignDoc>>(designDocsUri, withCredentials(options, auth)),
        queries: (options: MultipleQueryOptions) =>
          post<any, MultipleQueryOptions>(
            `${designDocsUri}/queries`,
            withCredentials(options, auth),
          ),
      };
    },
    bulkGet: (options = {}) =>
      get(`${dbUri}/_bulk_get`, withCredentials(options, auth)),
    bulkDocs: (options = {}) =>
      post(`${dbUri}/_bulk_docs`, withCredentials(options, auth)),
    changes: (options = {}) =>
      get(`${dbUri}/_changes`, withCredentials(options, auth)),
    viewCleanup: (options = {}) =>
      post(`${dbUri}/_view_cleanup`, withCredentials(options, auth)),
    compact: ({ designDoc, ...options } = {}) =>
      post(
        appendPath(`${dbUri}/_compact`, [designDoc]),
        withCredentials(options, auth),
      ),
    find: (options: any = {}) =>
      post(`${dbUri}/_find`, withCredentials(options, auth)),
    purge: (options: any = {}) =>
      post(`${dbUri}/_purge`, withCredentials(options, auth)),
    purgedInfoLimit: () => {
      const purgedInfoLimitUri = `${dbUri}/_purged_infos_limit`;
      return {
        read: (options: any = {}) =>
          get(purgedInfoLimitUri, withCredentials(options, auth)),
        update: (options: any = {}) =>
          request(
            purgedInfoLimitUri,
            withCredentials(
              {
                method: RequestMethod.Put,
                ...options,
              },
              auth,
            ),
          ),
      };
    },
    index: () => {
      const dbIndexUri = `${dbUri}/_index`;
      const { read, create } = resource(dbIndexUri, auth);
      return {
        read,
        create,
        destroy: ({ designDoc, index, ...options } = {}) =>
          request(`${dbIndexUri}/${designDoc}/json/${index}`, {
            method: RequestMethod.Delete,
            ...options,
          }),
      };
    },
    explain: (options: any = {}) =>
      post<any, DbFindOptions>(
        `${dbUri}/_explain`,
        withCredentials(options, auth),
      ),
    doc: doc(dbUri, auth),
    designDoc: doc<DesignDoc>(`${dbUri}/_design`, auth),
    shards: () => {
      const shardsUri = `${dbUri}/_shards`;
      return {
        read: (options: any = {}) =>
          get(shardsUri, withCredentials(options, auth)),
        doc: (docId: string) => (options: any = {}) =>
          get(`${shardsUri}/${docId}`, withCredentials(options, auth)),
        sync: (options: any = {}) =>
          post(`${dbUri}/_sync_shards`, withCredentials(options, auth)),
      };
    },
    revs: () => {
      const revsUri = `${dbUri}/_revs`;
      return {
        diff: (options: any = {}) =>
          post(`${revsUri}diff`, withCredentials(options, auth)),
        missing: (options: any = {}) =>
          post(`${revsUri}missing`, withCredentials(options, auth)),
        limit: (options: any = {}) =>
          get(revsUri, withCredentials(options, auth)),
      };
    },
    security: () => {
      const securityUri = `${dbUri}/_security`;
      return {
        read: (options: any = {}) =>
          get(securityUri, withCredentials(options, auth)),
        update: (options: any = {}) =>
          request(
            securityUri,
            withCredentials({ method: RequestMethod.Put, ...options }, auth),
          ),
      };
    },
  };
};
