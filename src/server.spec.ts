import test from "ava";
import { server } from "./server";
import { stub } from "sinon";

const baseUri = "http://localhost";

const request = stub(global, 'fetch');
  
test("server: initializes with a base uri", (t) => {
  t.assert(server(baseUri));
});

test("server: read calls GET at /", async (t) => {
  const serverInstance = server(baseUri);

  request.callThrough();
 //request.callsFake((uri, options) => new Promise((resolve) =>
 //  resolve({
 //    ok: true,
 //    json: () =>
 //      new Promise((resolve) => resolve({ spy: { data: { uri, options } } })),
 //  } as any)
 //));

  const {spy} = await serverInstance.read()

  t.is(spy.data.uri, baseUri);
  t.is(spy.data.options.method, 'GET');
});
