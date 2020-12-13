import test from "ava";
import { request, resolveRequest } from "./spec.helper";
import { server } from "./server";
import { AllDbOptions, DbInfoOptions } from "./db";
import {
  ClusterSetupAction,
  ClusterSetupOptions,
  ClusterSetupStatusOptions,
} from "./cluster";

const baseUri = "http://localhost";

test("server: initializes with a base uri", (t) => {
  t.assert(server(baseUri));
});

test("server: read calls GET at /", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.read();

  t.is(spy.data.uri, baseUri);
  t.is(spy.data.options.method, "GET");
});

test("server: activeTasks calls GET at /_active_tasks", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.activeTasks();

  t.is(spy.data.uri, `${baseUri}/_active_tasks`);
  t.is(spy.data.options.method, "GET");
});

test("server: allDbs calls GET at /_all_dbs", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.allDbs();

  t.is(spy.data.uri, `${baseUri}/_all_dbs`);
  t.is(spy.data.options.method, "GET");
});

test("server: allDbs calls with query options", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: AllDbOptions = {
    query: {
      skip: 10,
      limit: 10,
      startkey: "abc123",
      endkey: "abc456",
    },
  };

  const { spy } = await serverInstance.allDbs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_all_dbs?skip=${opts.query.skip}&limit=${opts.query.limit}&startkey=${opts.query.startkey}&endkey=${opts.query.endkey}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: dbsInfo calls POST at /_dbs_info", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.dbsInfo();

  t.is(spy.data.uri, `${baseUri}/_dbs_info`);
  t.is(spy.data.options.method, "POST");
});

test("server: dbsInfo calls with data params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: DbInfoOptions = {
    data: {
      keys: ["a", "b", "c"],
    },
  };
  const { spy } = await serverInstance.dbsInfo(opts);

  t.is(spy.data.uri, `${baseUri}/_dbs_info`);
  t.is(spy.data.options.method, "POST");
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

test("server: clusterSetup read calls GET at /_cluster_setup", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.clusterSetup().read();

  t.is(spy.data.uri, `${baseUri}/_cluster_setup`);
  t.is(spy.data.options.method, "GET");
});

test("server: clusterSetup read calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: ClusterSetupStatusOptions = {
    query: {
      ensure_dbs_exist: ["a", "b", "c"],
    },
  };
  const { spy } = await serverInstance.clusterSetup().read(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_cluster_setup?ensure_dbs_exist=${encodeURIComponent(
      opts.query.ensure_dbs_exist! as any
    )}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: clusterSetup create calls POST at /_cluster_setup", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.clusterSetup().create({});

  t.is(spy.data.uri, `${baseUri}/_cluster_setup`);
  t.is(spy.data.options.method, "POST");
});

test("server: clusterSetup create calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  // TODO: break up allowed params based on action value
  const opts: ClusterSetupOptions = {
    data: {
      action: ClusterSetupAction.AddNode,
      bind_address: "127.0.0.1",
      username: "foo",
      password: "baz",
      port: 1234,
      node_count: 3,
      remote_node: "1.1.1.1:5984",
      remote_current_user: "bar",
      remote_current_password: "baz",
      host: "127.0.0.1",
      ensure_dbs_exist: ["a", "b", "c"],
    },
  };
  const { spy } = await serverInstance.clusterSetup().create(opts);

  t.is(spy.data.uri, `${baseUri}/_cluster_setup`);
  t.is(spy.data.options.method, "POST");
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});
