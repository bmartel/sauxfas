import { stub } from "sinon";

global.btoa = function btoa(str: Buffer | string): string {
  let buffer: Buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), "binary");
  }

  return buffer.toString("base64");
};

export const base64 = stub(global, "btoa");
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

export const resourceGroup = (
  namespace: string,
  text: string,
  uri: string,
  group: (messageCreator: (message: string) => string, nsUri: string) => void
) => {
  group(
    (message: string, trailing: string = "") =>
      `${namespace}: ${text} ${message} at ${uri} ${trailing}`,
    uri
  );
};
