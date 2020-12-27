import { RevId } from './doc';
import { DocId } from './internal';

export type ErrorResult = {
  status: number;
  error: string;
  reason: string;
};

export type OkResult<T> = T extends string
  ? T
  : T extends Array<any>
  ? T
  : T extends Blob
  ? T
  : T & { ok?: true; _token?: string };

export enum RequestMethod {
  Head = 'HEAD',
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Copy = 'COPY',
}

export interface MaybeRequestQuery<T = Record<string, any>> {
  query?: T;
}
export interface RequestQuery<T = Record<string, any>> {
  query: T;
}
export interface MaybeRequestData<T = Record<string, any>> {
  data?: T;
}
export interface RequestData<T = Record<string, any>> {
  data: T;
}
export interface MaybeRequestForm<T = Record<string, any>> {
  form?: T;
}
export interface RequestForm<T = Record<string, any>> {
  form: T;
}
export type MaybeRequestMethod = {
  method?: RequestMethod;
};

export type RequestOptions<T = any> = Omit<RequestInit, 'method'> &
  MaybeRequestMethod &
  T & {
    id?: DocId;
    rev?: RevId;
  };

export type GetOptions<T = any, RQ = Record<string, any>> = RequestOptions<T> &
  MaybeRequestQuery<RQ>;

export type HeadOptions<T = any, RQ = Record<string, any>> = GetOptions<T, RQ>;

export type PostOptions<
  T = any,
  RD = Record<string, any>,
  RQ = Record<string, any>
> = RequestOptions<T> &
  MaybeRequestQuery<RQ> &
  (MaybeRequestData<RD> & MaybeRequestForm<RD>);

export type PutOptions<
  T = any,
  RD = Record<string, any>,
  RQ = Record<string, any>
> = PostOptions<T, RD, RQ>;

export type CopyOptions<T = any, RQ = Record<string, any>> = RequestOptions<T> &
  MaybeRequestQuery<RQ> & {
    destination: string;
  };

export type DestroyOptions<
  T = any,
  RQ = Record<string, any>
> = RequestOptions<T> & MaybeRequestQuery<RQ>;

export type Get<T = any, O = any> = (
  options: GetOptions<O>,
) => Promise<OkResult<T>>;

export type Head<T = any, O = any> = (
  options: HeadOptions<O>,
) => Promise<OkResult<T>>;

export type Copy<T = any, O = any> = (
  options: CopyOptions<O>,
) => Promise<OkResult<T>>;

export type Post<T = any, O = any> = (
  options: PostOptions<
    O & {
      data: T;
    }
  >,
) => Promise<OkResult<T>>;

export type Put<T = any, O = any> = (
  options: PutOptions<
    O & {
      data: T;
    }
  >,
) => Promise<OkResult<T>>;

export type Destroy<T = any, O = any> = (
  options: DestroyOptions<O>,
) => Promise<OkResult<T | {}>>;

export type FetchRequestOptions = RequestOptions<
  MaybeRequestData &
    MaybeRequestForm & {
      raw?: boolean;
    }
>;

export type FetchRequest<T = any> = (
  uri: string,
  options: FetchRequestOptions & MaybeRequestQuery,
) => Promise<OkResult<T>>;

export const query = (uri: string, options = {}) => {
  const values = (Object as any)
    .entries(options)
    .map(([key, option]: Array<any>) =>
      option === undefined ? undefined : `${key}=${encodeURIComponent(option)}`,
    )
    .filter(Boolean)
    .join('&');
  return `${uri}${values ? `?${values}` : ''}`;
};

export const appendPath = (
  uri: string,
  path: Array<string | null | undefined>,
): string => {
  return [uri, ...path].filter(Boolean).join('/');
};

export const unwrapResponse = async <T = any>(res: Response): Promise<T> => {
  const results = await res.json();
  const cookieHeaders = res.headers.get('set-cookie');
  const session = (Array.isArray(cookieHeaders)
    ? cookieHeaders
    : [cookieHeaders || '']
  ).find((c) => c.indexOf('AuthSession') > -1);

  if (session) {
    (results as any)._token = session.split(';')[0].replace('AuthSession=', '');
  }
  return results;
};
export const request = <T = any>(
  url: string,
  {
    method = RequestMethod.Get,
    data = undefined,
    form = undefined,
    headers = {},
    raw = false,
  }: FetchRequestOptions = {
    method: RequestMethod.Get,
    data: undefined,
    form: undefined,
    raw: false,
  },
): Promise<OkResult<T>> =>
  fetch(url, {
    method,
    headers: {
      ...headers,
      'content-type': form
        ? 'application/x-www-form-urlencoded; charset=utf-8'
        : (headers as any)['content-type'] || 'application/json',
      credentials: 'include',
      mode: 'cors',
    },
    body: (form
      ? new URLSearchParams(form)
      : data &&
        ((headers as any)['content-type'] || 'application/json') ===
          'application/json' &&
        !raw
      ? JSON.stringify(data)
      : data || undefined) as string,
  }).then(async (res) => {
    const useJson =
      ((headers as any)['content-type'] || 'application/json') ===
        'application/json' || method !== 'GET';
    if (!res.ok) {
      if (useJson) {
        const error = await res.json();
        error.status = res.status;
        throw error as ErrorResult;
      }
      throw res.body;
    }
    return useJson
      ? unwrapResponse<any>(res)
      : ['text/html', 'text/plain'].indexOf((headers as any)['content-type']) >
        -1
      ? res.text()
      : res.blob();
  });

export const get = <T = any, O = any>(uri: string, options: GetOptions<O>) =>
  request<T>(query(uri, options.query), {
    method: RequestMethod.Get,
    ...(options || {}),
  });

export const post = <T = any, O = any>(uri: string, options: PostOptions<O>) =>
  request<T>(uri, { method: RequestMethod.Post, ...options });
