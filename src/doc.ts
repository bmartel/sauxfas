import { attachment, Attachment, AttachmentList } from "./attachment";
import { DocId, DocIdFunc } from "./internal";
import { Manager, ManagerWithMetaRead } from "./manager";
import { Copy, request, query, RequestMethod } from "./request";
import { idResource } from "./resource";

export type RevId = string;

export enum RevisionStatus {
  Available = "available",
  Deleted = "deleted",
  Missing = "missing",
}

export interface RevInfo {
  rev: string;
  status: RevisionStatus;
}

export interface RevisionsList {
  ids: Array<DocId>;
  start: number;
}

export type Doc<T> = T & {
  _id: DocId;
  _rev: RevId;
  _deleted?: boolean;
  _attachments?: AttachmentList;
  _conflicts?: Array<string>;
  _deleted_conflicts?: Array<string>;
  _local_seq?: string;
  _revs_info?: Array<RevInfo>;
  _revisions?: RevisionsList;
};

export interface DocOptions {
  query?: {
    attachments?: boolean;
    att_encoding_info?: boolean;
    atts_since?: Array<string>;
    conflicts?: boolean;
    deleted_conflicts?: boolean;
    latest?: boolean;
    local_seq?: boolean;
    meta?: boolean;
    open_revs?: Array<string>;
    rev?: string;
    revs?: boolean;
    revs_info?: boolean;
  };
}

export type DocManager<T = any> = Manager<Doc<T>> & {
  copy: Copy<Doc<T>>;
  attachment(file: string): ManagerWithMetaRead<Doc<Attachment>>;
};

export const doc = <T = any>(uri: string) => <D = T>(
  eid?: DocId | DocIdFunc<D>
) => ({
  ...idResource<D>(uri, eid),
  copy: ({ id = eid, rev, destination } = {} as any) =>
    request(query(`${uri}/${id}`, { rev }), {
      headers: {
        "content-type": "application/json",
        destination,
      } as any,
      method: RequestMethod.Copy,
    }),
  attachment: attachment(`${uri}${eid ? `/${eid}` : ""}`),
});
