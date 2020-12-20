import { RevId } from "./doc";
import { DocId } from "./internal";

export type ErrorResult = {
  status: number;
  error: string;
  reason: string;
};

export type OkResult<T> = (T & { ok?: true }) | string | Blob;

export enum RequestMethod {
  Head = "HEAD",
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Copy = "COPY",
}

export type RequestOptions<T = any> = RequestInit &
  T & {
    id?: DocId;
    rev?: RevId;
  };

export type GetOptions<T = any> = RequestOptions<T> & {
  query?: Record<string, any>;
};

export type HeadOptions<T = any> = GetOptions<T>;

export type PostOptions<T = any> = RequestOptions<T> & {
  query?: Record<string, any>;
  data?: Record<string, any>;
  form?: Record<string, any>;
};

export type PutOptions<T = any> = RequestOptions<T> & {
  query?: Record<string, any>;
  data?: Record<string, any>;
  form?: Record<string, any>;
};

export type CopyOptions<T = any> = RequestOptions<T> & {
  destination: string;
};

export type DestroyOptions<T = any> = RequestOptions<T>;

export type Get<T = any, O = any> = (
  options?: GetOptions<O>
) => Promise<OkResult<T>>;

export type Head<T = any, O = any> = (
  options?: HeadOptions<O>
) => Promise<OkResult<T>>;

export type Copy<T = any, O = any> = (
  options: CopyOptions<O>
) => Promise<OkResult<T | {}>>;

export type Post<T = any, O = any> = (
  options?: PostOptions<
    O & {
      data: Partial<T>;
    }
  >
) => Promise<OkResult<T | {}>>;

export type Put<T = any, O = any> = (
  options?: PutOptions<
    O & {
      data: Partial<T>;
    }
  >
) => Promise<OkResult<T | {}>>;

export type Destroy<T = any, O = any> = (
  options?: DestroyOptions<O>
) => Promise<OkResult<T | {}>>;

export type FetchRequestOptions = RequestOptions<{
  query?: Record<string, any>;
  method?: string;
  data?: Record<string, any> | any;
  form?: Record<string, any>;
  raw?: boolean;
}>;

export type FetchRequest<T = any> = (
  uri: string,
  options: FetchRequestOptions
) => Promise<OkResult<T>>;

export const query = (uri: string, options = {}) => {
  const values = (Object as any)
    .entries(options)
    .map(([key, option]: Array<any>) =>
      option === undefined ? undefined : `${key}=${encodeURIComponent(option)}`
    )
    .filter(Boolean)
    .join("&");
  return `${uri}${values ? `?${values}` : ""}`;
};

export const appendPath = (
  uri: string,
  path: Array<string | null | undefined>
): string => {
  return [uri, ...path].filter(Boolean).join("/");
};

export const request = <T = any>(
  url: string,
  {
    method = "GET",
    data = undefined,
    form = undefined,
    headers = {},
    raw = false,
  }: FetchRequestOptions = {
    method: "GET",
    data: undefined,
    form: undefined,
    raw: false,
  }
): Promise<OkResult<T>> =>
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
      ((headers as any)["content-type"] || "application/json") ===
        "application/json" || method !== "GET";
    if (!res.ok) {
      if (useJson) {
        const error = await res.json();
        error.status = res.status;
        throw error as ErrorResult;
      }
      throw res.body;
    }
    return useJson
      ? (res.json() as Promise<OkResult<T>>)
      : (headers as any)["content-type"] === "text/html"
      ? (res.text() as Promise<string>)
      : (res.blob() as Promise<Blob>);
  });

export const get = <T = any, O = any>(uri: string, options?: GetOptions<O>) =>
  request<T>(query(uri, options?.query), {
    method: RequestMethod.Get,
    ...(options || {}),
  });

export const post = <T = any, O = any>(uri: string, options: PostOptions<O>) =>
  request<T>(uri, { method: RequestMethod.Post, ...options });
