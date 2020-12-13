import { doc, DocManager } from "./doc";
import { DocId } from "./internal";
import { Manager, ManagerWithMetaRead } from "./manager";
import { get, Get, post } from "./request";
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

export type DbManager<T = any> = Omit<Manager<T>, "update"> & {
  doc<D = any>(id: DocId): DocManager<D>;
  designDoc<D = DesignDoc>(docid: DocId): ManagerWithMetaRead<D>;
  index(): Pick<Manager<{}>, "read" | "create">;
  allDocs: Get;
  designDocs: Get<Array<DesignDoc>>;
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
    create: (options) => create({ ...options, method: "PUT" }),
    destroy,
    allDocs: (options = {}) => get(`${dbUri}/_all_docs`, options),
    designDocs: (options = {}) => get(`${dbUri}/_design_docs`, options),
    find: (options: any = {}) => post(`${dbUri}/_find`, options),
    index: () => resource(`${dbUri}/_index`),
    doc: doc(dbUri),
    designDoc: doc<DesignDoc>(`${dbUri}/_design`),
  };
};
