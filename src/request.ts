import { RevId } from "./doc";
import { DocId } from "./internal";

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

export enum RequestMethod {
  Head = "HEAD",
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Copy = "COPY",
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

export const query = (uri: string, options = {}) =>
  `${uri}?${(Object as any)
    .entries(options)
    .map(([key, option]: Array<any>) => `${key}=${encodeURIComponent(option)}`)
    .join("&")}`;

export const appendPath = (
  uri: string,
  path: Array<string | null | undefined>
): string => {
  return [uri, ...path].filter(Boolean).join("/");
};

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
