import { doc, DocManager } from "./doc";
import { DocId, MultipleQueryOptions } from "./internal";
import { Manager, ManagerWithMetaRead } from "./manager";
import { Selector, SortBy } from "./query";
import {
  Destroy,
  get,
  Get,
  Post,
  post,
  request,
  RequestMethod,
} from "./request";
import { resource } from "./resource";
import { DesignDoc } from "./view";

export enum DbFeed {
  Normal = "normal",
  Longpoll = "longpoll",
  Continuous = "continuous",
  Eventsource = "eventsource",
}
export enum DbEvent {
  Created = "created",
  Updated = "updated",
  Destroyed = "deleted",
}

export interface DbInfo {
  key: string;
  info: {
    db_name: string;
    update_seq: string;
    sizes: {
      file: number;
      external: number;
      active: number;
    };
    purge_seq: number;
    doc_del_count: number;
    doc_count: number;
    disk_format_version: number;
    compact_running: boolean;
    cluster: {
      q: number;
      n: number;
      w: number;
      r: number;
    };
    instance_start_time: string;
  };
}

export interface DbInfoOptions {
  data: {
    keys: Array<string>;
  };
}

export interface AllDbOptions {
  query: {
    descending?: boolean;
    endkey?: string;
    end_key?: string;
    limit?: number;
    skip?: number;
    startkey?: string;
    start_key?: string;
  };
}

export interface DbUpdateOptions {
  query: {
    feed?: DbFeed;
    timeout?: number;
    heartbeat?: number;
    since?: string;
  };
}

export interface DbUpdateResult {
  results: Array<{
    db_name: string;
    type: DbEvent;
    seq: string;
  }>;
  last_seq: string;
}

export interface DbFindOptions {
  data: {
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
  };
}

export type DbManager<T = any> = Omit<Manager<T>, "update"> & {
  doc<D = any>(id: DocId): DocManager<D>;
  designDoc<D = DesignDoc>(docid: DocId): ManagerWithMetaRead<D>;
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
    read: Get<Array<DesignDoc>>;
    queries: Post;
  };
  bulkGet: Get;
  bulkDocs: Post;
  find: Post;
  explain: Post;
};

export type DbResource<T = any> = (name: string) => DbManager<T>;

export interface DbOperations {
  db<T = any>(name: string): DbManager<T>;
}

export const db = <T = any>(uri: string): DbResource<T> => (name: string) => {
  const dbUri = `${uri}/${name}`;
  const { read, create, destroy } = resource(dbUri);
  return {
    read,
    create: (options) => create({ ...options, method: RequestMethod.Put }),
    destroy,
    allDocs: () => {
      const allDocsUri = `${dbUri}/_all_docs`;
      return {
        read: (options = {}) => get(allDocsUri, options),
        queries: (options: MultipleQueryOptions) =>
          post<any, MultipleQueryOptions>(`${allDocsUri}/queries`, options),
      };
    },
    designDocs: () => {
      const designDocsUri = `${dbUri}/_design_docs`;
      return {
        read: (options = {}) => get(designDocsUri, options),
        queries: (options: MultipleQueryOptions) =>
          post<any, MultipleQueryOptions>(`${designDocsUri}/queries`, options),
      };
    },
    bulkGet: (options = {}) => get(`${dbUri}/_bulk_get`, options),
    bulkDocs: (options = {}) => post(`${dbUri}/_bulk_docs`, options),
    find: (options: any = {}) => post(`${dbUri}/_find`, options),
    index: () => {
      const dbIndexUri = `${dbUri}/_index`;
      const { read, create } = resource(dbIndexUri);
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
      post<any, DbFindOptions>(`${dbUri}/_explain`, options),
    doc: doc(dbUri),
    designDoc: doc<DesignDoc>(`${dbUri}/_design`),
  };
};
