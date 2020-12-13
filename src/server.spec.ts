import test from "ava";
import { request, resolveRequest } from './spec.helper'
import { server } from "./server";

const baseUri = "http://localhost";
  
test("server: initializes with a base uri", (t) => {
  t.assert(server(baseUri));
});

test("server: read calls GET at /", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const {spy} = await serverInstance.read()

  t.is(spy.data.uri, baseUri);
  t.is(spy.data.options.method, 'GET');
});
