export type DocId = string;

export type RevId = string;

export type ErrorResult = {
  status: number;
  error: string;
  reason: string;
};

export type OkResult<T> =
  | T
  | {
      ok: true;
    };

export type ViewKey =
  | string
  | number
  | Array<any>
  | Record<string, any>
  | any
  | null;
export type ViewValue =
  | string
  | number
  | Array<any>
  | Record<string, any>
  | any
  | null;

export type ViewResult<K = ViewKey, V = ViewValue> = {
  offset: number;
  total_rows: number;
  rows: Array<{
    id: DocId;
    key: K;
    value: V;
  }>;
};

export interface Attachment {
  content_type: string;
  data: string;
  digest: string;
  revpos: number;
}

export type AttachmentStub = Attachment & {
  stub: true;
};

export type AttachmentRelated = Attachment & {
  follows: true;
};

export interface AttachmentList {
  [k: string]: Attachment | AttachmentStub | AttachmentRelated;
}

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

export type Roles = Array<string>;

export type User = Doc<{
  name: string;
  roles: Roles;
  type: "user";
  password: string;
}>;

export interface UserContext {
  userCtx: Omit<User, "password">;
}

export type GetOptions<T = any> = {
  query?: Record<string, any>;
} & {
  [k in keyof RequestInit]: any;
} &
  T;

export type HeadOptions<T = any> = GetOptions<T>;

export type PostOptions<T = any> = {
  data?: Record<string, any>;
  form?: Record<string, any>;
} & {
  [k in keyof RequestInit]: any;
} &
  T;

export type Get<T = any, O = any> = (
  options?: GetOptions<
    O & {
      id?: DocId;
      rev?: RevId;
    }
  >
) => Promise<OkResult<T> | ErrorResult>;

export type Head<T = any, O = any> = (
  options?: HeadOptions<
    O & {
      id?: DocId;
      rev?: RevId;
    }
  >
) => Promise<OkResult<T> | ErrorResult>;

export type Copy<T = any> = (options: {
  id?: DocId;
  rev: RevId;
  destination: string;
}) => Promise<OkResult<T> | ErrorResult>;

export type Post<T = any, O = any> = (
  options: PostOptions<
    O & {
      id?: DocId;
      rev?: RevId;
      data: Partial<T>;
    }
  >
) => Promise<OkResult<T | {}> | ErrorResult>;

export type Put<T = any, O = any> = Post<T, O>;

export type Destroy<T = any> = (
  options: {
    id: DocId;
    rev?: RevId;
  } & {
    [k in keyof RequestInit]: any;
  }
) => Promise<OkResult<T> | ErrorResult>;

export interface Manager<T> {
  read: Get<T>;
  create: Put<T> | Post<T>;
  update: Put<T>;
  destroy: Destroy<T>;
}

export type ManagerWithMetaRead<T> = Omit<Manager<T>, "read"> & {
  read: Get<T> | Head<T>;
};

export type DocManager<T = any> = Manager<Doc<T>> & {
  copy: Copy<Doc<T>>;
  attachment(file: string): ManagerWithMetaRead<Doc<Attachment>>;
};

export type DbManager<T = any> = Omit<Manager<T>, "update"> & {
  doc<D = any>(id: DocId): DocManager<D>;
  designDoc<D = DesignDoc>(docid: DocId): ManagerWithMetaRead<D>;
  index(): Pick<Manager<{}>, "read" | "create">;
  allDocs: Get;
  designDocs: Get<Array<DesignDoc>>;
};

export interface Sofa {
  read: Get;
  uuid(count?: number): Promise<Array<DocId>>;
  users(): DocManager<User>;
  session(): Omit<Manager<Doc<UserContext>>, "update">;
  db<T = any>(name: string): DbManager<T>;
  replicate: Post;
  activeTasks: Get;
  allDbs: Get;
  dbsInfo: Post;
}

export interface SofaClient {
  (options: {
    endpoint: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  }): Sofa;
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

export interface ReplicationHistory {
  doc_write_failures: number;
  docs_read: number;
  docs_written: number;
  end_last_seq: number;
  end_time: Date | string;
  missing_checked: number;
  missing_found: number;
  recorded_seq: number;
  session_id: string;
  start_last_seq: number;
  start_time: Date | string;
}

export interface Replication {
  history: Array<ReplicationHistory>;
  replication_id_version: number;
  session_id: string;
  source_last_seq: number;
}

export interface ActiveTask {
  changes_done: number;
  database: string;
  pid: string;
  progress: number;
  started_on: number;
  status: string;
  task: string;
  total_changes: number;
  type: string;
  updated_on: number;
}

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

export interface ReplicateOptions {
  data: {
    source: string;
    target: string;
    cancel?: boolean;
    filter?: string;
    docIds?: Array<string>;
    continuous?: boolean;
    createTarget?: boolean;
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

export interface SecurityObject {
  admins: {
    names: Array<string>;
    roles: Array<string>;
  };
  members: {
    names: Array<string>;
    roles: Array<string>;
  };
}

export interface UserContextObject {
  db: string;
  name: string;
  roles: Roles;
}

export enum RequestMethod {
  Head = "HEAD",
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Copy = "COPY",
}
export interface RequestObject {
  body: string;
  cookie: any;
  form: FormData;
  headers: Headers;
  id: DocId | null;
  info: DbInfo;
  method: RequestMethod;
  path: Array<string>;
  peer: string;
  query: Record<string, any>;
  raw_path: string;
  requested_path: Array<string>;
  secObj: SecurityObject;
  userCtx: UserContextObject;
  uuid: string;
}

export type ValidateDocUpdate = <T = any>(
  newDoc: Doc<T>,
  oldDoc: Doc<T>,
  userCtx: UserContextObject,
  secObj: SecurityObject
) => any;

export type MapFunc = <T = any>(doc: Doc<T>) => any;
export type ReduceFunc = (
  key: any,
  values: Array<any>,
  rereduce?: boolean
) => any;

export interface ViewFuncs {
  [k: string]: {
    map?: MapFunc | string;
    reduce?: ReduceFunc | string;
  };
}

export interface DesignDoc {
  language: string;
  options: Record<string, any>;
  filters: Record<string, any>;
  updates: Record<string, any>;
  views: ViewFuncs;
  validate_doc_update: ValidateDocUpdate | string;
  autoupdate: boolean;
}

export type FetchRequest<T = any> = (
  uri: string,
  options: RequestInit & {
    query?: Record<string, any>;
    method?: string;
    data?: Record<string, any> | any;
    form?: Record<string, any>;
    raw?: boolean;
  }
) => Promise<OkResult<T> | ErrorResult>;

export const request: FetchRequest = (
  url: string,
  {
    method = "GET",
    data = undefined,
    form = undefined,
    headers = {},
    raw = false,
  } = {
    raw: false,
  }
) =>
  fetch(url, {
    method,
    headers: {
      ...headers,
      "content-type": form
        ? "application/x-www-form-urlencoded; charset=utf-8"
        : (headers as any)["content-type"] || "application/json",
      credentials: "include",
      mode: "cors",
    },
    body: form
      ? new URLSearchParams(form)
      : data &&
        ((headers as any)["content-type"] || "application/json") ===
          "application/json" &&
        !raw
      ? JSON.stringify(data)
      : data || undefined,
  }).then(async (res) => {
    const useJson =
      (headers as any)["content-type"] === "application/json" ||
      method !== "GET";
    if (!res.ok) {
      if (useJson) {
        const error = await res.json();
        error.status = res.status;
        throw error;
      }
      throw res.body;
    }
    return useJson
      ? res.json()
      : (headers as any)["content-type"] === "text/html"
      ? res.text()
      : res.blob();
  });

export const query = (uri: string, options = {}) =>
  `${uri}?${(Object as any)
    .entries(options)
    .map(([key, option]: Array<any>) => `${key}=${encodeURIComponent(option)}`)
    .join("&")}`;

export const get = <T = any, O = any>(
  uri: string,
  options: GetOptions<O>
): Promise<OkResult<T> | ErrorResult> =>
  request(query(uri, options?.query), { method: "GET", ...(options || {}) });

export const post = <T = any, O = any>(
  uri: string,
  options: PostOptions<O>
): Promise<OkResult<T | {}> | ErrorResult> =>
  request(uri, { method: "POST", ...options } as any);

export const resource = <T = any>(uri: string): Omit<Manager<T>, "update"> => ({
  read: ({ method = "GET", ...options } = {}) =>
    request(query(uri, options?.query), {
      method,
    }),
  create: ({ data, form, method = "POST" }) =>
    post(uri, {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
    }),
  destroy: (options = {} as any) =>
    request(query(uri, (options as any).query), {
      method: "DELETE",
    }),
});

export const appendPath = (
  uri: string,
  path: Array<string | null | undefined>
): string => {
  return [uri, ...path].filter(Boolean).join("/");
};
export const idFromDoc = <T>(
  doc: T,
  id?: DocId | DocIdFunc<T>
): DocId | undefined => {
  return typeof id === "function" ? id(doc) : id;
};
export const idResource = <T = any>(
  uri: string,
  eid?: DocId | DocIdFunc<T>
): Manager<T> => ({
  read: ({ id = eid, method = "GET", ...options } = {} as any) =>
    request(query(appendPath(uri, [idFromDoc(id)]), options.query), {
      method,
      ...options,
    }),
  create: ({ id = eid, data, method = "PUT", ...options }) =>
    request(appendPath(uri, [idFromDoc(id)]), {
      method,
      data: data as any,
      ...options,
    }),
  update: ({ id = eid, rev, data, method = "PUT", ...options }) =>
    request(query(appendPath(uri, [idFromDoc(id)]), { rev }), {
      method,
      data: data as any,
      ...options,
    }),
  destroy: ({ id = eid, rev, ...options }) =>
    request(query(appendPath(uri, [idFromDoc(id)]), { rev }), {
      method: "DELETE",
      ...options,
    }),
});

export const attachment = <T = any>(
  uri: string
): ((file: string) => Manager<T>) => (file: string) => {
  const fileUri = `${uri}/${file}`;
  const { read, create, update, destroy } = idResource(fileUri);
  return {
    read: (options: any = {}) =>
      read({
        ...options,
        headers: {
          "content-type": options.contentType,
        },
      }),
    create: (options) => create({ ...options, raw: true }),
    update: (options) => update({ ...options, raw: true }),
    destroy,
  };
};

export type DocIdFunc<T> = (doc: T) => string;

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
      method: "COPY",
    }),
  attachment: attachment(`${uri}${eid ? `/${eid}` : ""}`),
});

export const sofa: SofaClient = ({
  endpoint,
  username,
  password,
  ssl = false,
}) => {
  const scheme = ssl ? "https://" : "http://";
  const publicUri = scheme + endpoint;
  const privateUri =
    username && password
      ? scheme + username + ":" + password + "@" + endpoint
      : publicUri;
  return {
    read: () => get(privateUri, {}),
    uuid: (count = 1) =>
      request(`${privateUri}/_uuids?count=${count}`, {
        method: "GET",
      }).then((res) => res.uuids),
    users: () =>
      doc<User>(`${privateUri}/_users`)(
        (doc) => "org.couchdb.user:" + doc.name
      ),
    session: () => resource(`${privateUri}/_session`),
    db: (name: string) => {
      const dbUri = `${privateUri}/${name}`;
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
    },
    activeTasks: () =>
      get<Array<ActiveTask>>(`${privateUri}/_active_tasks`, {}),
    allDbs: (options?: AllDbOptions) =>
      get<Array<string>, AllDbOptions>(`${privateUri}/_all_dbs`, options!),
    dbsInfo: (options?: DbInfoOptions) =>
      post<Array<DbInfo>, DbInfoOptions>(`${privateUri}/_dbs_info`, options!),
    replicate: (options?: ReplicateOptions) =>
      post<Array<Replication>, ReplicateOptions>(
        `${privateUri}/_replicate`,
        options!
      ),
  };
};
