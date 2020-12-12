import { DocId, DocManager } from "./doc";
import { Manager, ManagerWithMetaRead } from "./manager";
import { Get } from "./request";
import { DesignDoc } from "./view";

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

export type DbManager<T = any> = Omit<Manager<T>, "update"> & {
  doc<D = any>(id: DocId): DocManager<D>;
  designDoc<D = DesignDoc>(docid: DocId): ManagerWithMetaRead<D>;
  index(): Pick<Manager<{}>, "read" | "create">;
  allDocs: Get;
  designDocs: Get<Array<DesignDoc>>;
};
