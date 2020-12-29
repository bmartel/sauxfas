import { attachment, Attachment, AttachmentList } from './attachment';
import { AuthCredentials, withCredentials } from './auth';
import { DocId, DocIdFunc } from './internal';
import { Manager } from './manager';
import {
  Copy,
  request,
  query,
  RequestMethod,
  CopyOptions,
  MaybeRequestQuery,
} from './request';
import { idResource } from './resource';

export type RevId = string;

export enum RevisionStatus {
  Available = 'available',
  Deleted = 'deleted',
  Missing = 'missing',
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

export interface DocQueryOptions {
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
}

export type DocOptions = MaybeRequestQuery<DocQueryOptions>;

export interface DesignDocQueryOptions {
  conflicts?: boolean;
  descending?: boolean;
  endkey?: string;
  endkey_docid?: string;
  include_docs?: boolean;
  inclusive_end?: boolean;
  key?: string;
  keys?: Array<string>;
  limit?: number;
  skip?: number;
  startkey?: string;
  startkey_docid?: string;
  update_seq?: boolean;
}
export type DesignDocOptions = MaybeRequestQuery<DesignDocQueryOptions>;

export type DocManager<T = any> = Manager<Doc<T>, DocOptions> & {
  copy: Copy<CopyOptions, Doc<T>>;
  attachment(file: string): Manager<Doc<Attachment>>;
};

export const doc = <T = any>(uri: string, auth?: AuthCredentials) => <D = T>(
  eid?: DocId | DocIdFunc<D>,
) => ({
  ...idResource<D, DocOptions>(uri, auth, eid),
  copy: <R = D>({ id = eid as string, rev, destination }: CopyOptions<R>) =>
    request(
      query(`${uri}/${id}`, { rev }),
      withCredentials(
        {
          headers: {
            'content-type': 'application/json',
            destination,
          },
          method: RequestMethod.Copy,
        },
        auth,
      ),
    ),
  attachment: attachment(`${uri}${eid ? `/${eid}` : ''}`, auth),
});
