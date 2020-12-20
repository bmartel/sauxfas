import { DocId, DocIdFunc, idFromDoc } from "./internal";
import {
  appendPath,
  DestroyOptions,
  GetOptions,
  HeadOptions,
  PostOptions,
  PutOptions,
  query,
  request,
  RequestMethod,
} from "./request";

export const resource = <T = any>(uri: string) => ({
  read: <R = T>(
    {
      method = RequestMethod.Get,
      ...options
    }: GetOptions<R> | HeadOptions<R> = {} as any
  ) =>
    request<R>(query(uri, options?.query), {
      method,
    } as GetOptions<R> | HeadOptions<R>),
  create: <R = T>({
    data,
    form,
    method = RequestMethod.Post,
    ...options
  }: PostOptions<R> | PutOptions<R>) =>
    request<R>(query(uri, options?.query), {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    } as PostOptions<R> | PutOptions<R>),
  destroy: <R = T>(options: DestroyOptions<R> = {} as any) =>
    request<R>(query(uri, (options as any).query), {
      method: RequestMethod.Delete,
    } as DestroyOptions<R>),
});

export const idResource = <T = any>(
  uri: string,
  eid?: DocId | DocIdFunc<T>
) => ({
  read: <R = T>(
    {
      id = eid as any,
      method = RequestMethod.Get,
      ...options
    }: GetOptions<R> | HeadOptions<R> = {} as any
  ) =>
    request<R>(
      query(appendPath(uri, [idFromDoc(options.query, id)]), options.query),
      {
        method,
        ...options,
      } as GetOptions<R> | HeadOptions<R>
    ),
  create: <R = T>({
    id = eid as any,
    data,
    form,
    method = RequestMethod.Put,
    ...options
  }: PostOptions<R> | PutOptions<R>) =>
    request<R>(
      query(appendPath(uri, [idFromDoc(form || data, id)]), options.query),
      {
        method,
        data: data as any,
        form: form as any,
        raw: !!form,
        ...options,
      } as PostOptions<R> | PutOptions<R>
    ),
  update: <R = T>({
    id = eid as any,
    rev,
    data,
    form,
    method = RequestMethod.Put,
    ...options
  }: PostOptions<R> | PutOptions<R>) =>
    request<R>(query(appendPath(uri, [idFromDoc(form || data, id)]), { rev }), {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    } as PostOptions<R> | PutOptions<R>),
  destroy: <R = T>(
    {
      id = eid as any,
      rev = undefined,
      ...options
    }: DestroyOptions<R> = {} as any
  ) =>
    request<R>(query(appendPath(uri, [idFromDoc({}, id)]), { rev }), {
      method: RequestMethod.Delete,
      ...options,
    } as DestroyOptions<R>),
});
