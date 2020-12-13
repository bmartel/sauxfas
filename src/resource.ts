import { DocId, DocIdFunc, idFromDoc } from "./internal";
import { Manager } from "./manager";
import { appendPath, query, request, RequestMethod } from "./request";

export const resource = <T = any>(uri: string): Omit<Manager<T>, "update"> => ({
  read: ({ method = RequestMethod.Get, ...options } = {}) =>
    request(query(uri, options?.query), {
      method,
    }),
  create: ({ data, form, method = RequestMethod.Post, ...options }) =>
    request(uri, {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    }),
  destroy: (options = {} as any) =>
    request(query(uri, (options as any).query), {
      method: RequestMethod.Delete,
    }),
});

export const idResource = <T = any>(
  uri: string,
  eid?: DocId | DocIdFunc<T>
): Manager<T> => ({
  read: ({ id = eid, method = RequestMethod.Get, ...options } = {} as any) =>
    request(
      query(appendPath(uri, [idFromDoc(options.query, id)]), options.query),
      {
        method,
        ...options,
      }
    ),
  create: ({ id = eid, data, form, method = RequestMethod.Put, ...options }) =>
    request(appendPath(uri, [idFromDoc(form || data, id)]), {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    }),
  update: ({
    id = eid,
    rev,
    data,
    form,
    method = RequestMethod.Put,
    ...options
  }) =>
    request(query(appendPath(uri, [idFromDoc(form || data, id)]), { rev }), {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    }),
  destroy: ({ id = eid, data, rev, ...options }) =>
    request(query(appendPath(uri, [idFromDoc(data, id)]), { rev }), {
      method: RequestMethod.Delete,
      ...options,
    }),
});
