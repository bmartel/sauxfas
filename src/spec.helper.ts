import { stub } from "sinon";

export const request = stub(global, "fetch");

export const resolveRequest = ({ ok = true, body = undefined } = {}) => (
  uri: RequestInfo,
  options?: RequestInit
) =>
  new Promise<any>((resolve) =>
    resolve({
      ok,
      body,
      json: () =>
        new Promise((resolve) => resolve({ spy: { data: { uri, options } } })),
      blob: () =>
        new Promise((resolve) => resolve({ spy: { data: { uri, options } } })),
    } as any)
  );