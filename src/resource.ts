import { DocId, DocIdFunc, idFromDoc } from "./internal";
import { Manager } from "./manager";
import { appendPath, query, request } from "./request";

export const resource = <T = any>(uri: string): Omit<Manager<T>, "update"> => ({
  read: ({ method = "GET", ...options } = {}) =>
    request(query(uri, options?.query), {
      method,
    }),
  create: ({ data, form, method = "POST", ...options }) =>
    request(uri, {
      method,
      data: data as any,
      form: form as any,
      raw: !!form,
      ...options,
    }),
  destroy: (options = {} as any) =>
    request(query(uri, (options as any).query), {
      method: "DELETE",
    }),
});

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
