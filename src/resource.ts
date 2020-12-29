import { AuthCredentials, withCredentials } from "./auth";
import { DocId, DocIdFunc, idFromDoc } from "./internal";
import {
  appendPath,
  DestroyOptions,
  GetOptions,
  HeadOptions,
  OkResult,
  PostOptions,
  PutOptions,
  query,
  request,
  RequestMethod,
} from "./request";

export const resource = <T = any, V = any>(
  uri: string,
  auth?: AuthCredentials
) => ({
  read: <O = V, R = T>({
    method = RequestMethod.Get,
    ...options
  }: GetOptions<O> | HeadOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(uri, options.query),
      withCredentials(
        {
          method: method as any,
          ...options,
        },
        auth
      ) as GetOptions<O> | HeadOptions<O>
    ) as Promise<OkResult<R>>,
  create: <O = V, R = T>({
    data,
    form,
    method = RequestMethod.Post,
    ...options
  }: PostOptions<O> | PutOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(uri, options.query),
      withCredentials(
        {
          method,
          data: data as any,
          form: form as any,
          raw: !!form,
          ...options,
        },
        auth
      ) as PostOptions<O> | PutOptions<O>
    ) as Promise<OkResult<R>>,
  destroy: <O = V, R = T>(options: DestroyOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(uri, options.query),
      withCredentials(
        {
          method: RequestMethod.Delete,
          ...options,
        },
        auth
      ) as DestroyOptions<O>
    ) as Promise<OkResult<R>>,
});

export const idResource = <T = any, V = any>(
  uri: string,
  auth?: AuthCredentials,
  eid?: DocId | DocIdFunc<T>
) => ({
  read: <O = V, R = T>({
    id = eid as any,
    method = RequestMethod.Get,
    ...options
  }: GetOptions<O> | HeadOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(appendPath(uri, [idFromDoc(options.query, id)]), options.query),
      withCredentials(
        {
          method,
          ...options,
        },
        auth
      ) as GetOptions<O> | HeadOptions<O>
    ) as Promise<OkResult<R>>,
  create: <O = V, R = T>({
    id = eid as any,
    data,
    form,
    method = RequestMethod.Put,
    ...options
  }: PostOptions<O> | PutOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(appendPath(uri, [idFromDoc(form || data, id)]), options.query),
      withCredentials(
        {
          method,
          data: data as any,
          form: form as any,
          raw: !!form,
          ...options,
        },
        auth
      ) as PostOptions<O> | PutOptions<O>
    ) as Promise<OkResult<R>>,
  update: <O = V, R = T>({
    id = eid as any,
    rev,
    data,
    form,
    method = RequestMethod.Put,
    ...options
  }: PostOptions<O> | PutOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(appendPath(uri, [idFromDoc(form || data, id)]), { rev }),
      withCredentials(
        {
          method,
          data: data as any,
          form: form as any,
          raw: !!form,
          ...options,
        },
        auth
      ) as PostOptions<O> | PutOptions<O>
    ) as Promise<OkResult<R>>,
  destroy: <O = V, R = T>({
    id = eid as any,
    rev = undefined,
    ...options
  }: DestroyOptions<O>): Promise<OkResult<R>> =>
    request<R>(
      query(appendPath(uri, [idFromDoc({}, id)]), { rev }),
      withCredentials(
        {
          method: RequestMethod.Delete,
          ...options,
        },
        auth
      ) as DestroyOptions<O>
    ) as Promise<OkResult<R>>,
});
