import test from "ava";
import { request, resolveRequest, resourceGroup } from "./spec.helper";
import { server } from "./server";
import { AllDbOptions, DbFeed, DbInfoOptions, DbUpdateOptions } from "./db";
import {
  ClusterSetupAction,
  ClusterSetupOptions,
  ClusterSetupStatusOptions,
} from "./cluster";
import { UuidOptions } from "./internal";
import { ReplicateOptions } from "./replication";
import { SchedulerDocOptions, SchedulerJobOptions } from "./scheduler";
import { SearchAnalyzeOptions } from "./search";
import { ReshardJobCreateOptions } from "./reshard";

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

test("server: dbUpdates read calls GET at /_db_updates", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.dbUpdates();

  t.is(spy.data.uri, `${baseUri}/_db_updates`);
  t.is(spy.data.options.method, "GET");
});

test("server: dbUpdates read calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: DbUpdateOptions = {
    query: {
      feed: DbFeed.Normal,
      timeout: 60,
      heartbeat: 60000,
      since: "now",
    },
  };
  const { spy } = await serverInstance.dbUpdates(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_db_updates?feed=${opts.query.feed}&timeout=${opts.query.timeout}&heartbeat=${opts.query.heartbeat}&since=${opts.query.since}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: membership calls GET at /_membership", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.membership();

  t.is(spy.data.uri, `${baseUri}/_membership`);
  t.is(spy.data.options.method, "GET");
});

test("server: uuids calls GET at /_uuids", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.uuids();

  t.is(spy.data.uri, `${baseUri}/_uuids`);
  t.is(spy.data.options.method, "GET");
});

test("server: uuids calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  const opts: UuidOptions = {
    query: {
      count: 2,
    },
  };

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.uuids(opts);

  t.is(spy.data.uri, `${baseUri}/_uuids?count=${opts.query.count}`);
  t.is(spy.data.options.method, "GET");
});

test("server: replicate calls POST at /_replicate with data params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: ReplicateOptions = {
    data: {
      source: "1.1.1.1:5984",
      target: "1.1.2.2:5984",
      filter: "somefilterfunc",
      doc_ids: ["a", "b", "c"],
      cancel: false,
      continuous: true,
      create_target: true,
    },
  };
  const { spy } = await serverInstance.replicate(opts);

  t.is(spy.data.uri, `${baseUri}/_replicate`);
  t.is(spy.data.options.method, "POST");
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

test("server: scheduler jobs calls GET at /_scheduler/_jobs", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.scheduler().jobs();

  t.is(spy.data.uri, `${baseUri}/_scheduler/_jobs`);
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler jobs calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerJobOptions = {
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().jobs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_jobs?limit=${opts.query.limit}&skip=${opts.query.skip}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls GET at /_scheduler/_docs", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.scheduler().docs();

  t.is(spy.data.uri, `${baseUri}/_scheduler/_docs`);
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs?limit=${opts.query!.limit}&skip=${
      opts.query!.skip
    }`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo",
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(spy.data.uri, `${baseUri}/_scheduler/_docs/${opts.replicator}`);
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator with slashes in the name", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo/bar",
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(spy.data.uri, `${baseUri}/_scheduler/_docs/${opts.replicator}`);
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator and query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo",
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}?limit=${
      opts.query!.limit
    }&skip=${opts.query!.skip}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator with slashes in the name and query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo/bar",
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}?limit=${
      opts.query!.limit
    }&skip=${opts.query!.skip}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator and doc id", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo",
    id: "bar",
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}/${opts.id}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator with slashes in the name and doc id", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo/bar",
    id: "baz",
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}/${opts.id}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator, doc id and query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo",
    id: "bar",
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}/${opts.id}?limit=${
      opts.query!.limit
    }&skip=${opts.query!.skip}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: scheduler docs calls with replicator with slashes in the name, doc id and query params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SchedulerDocOptions = {
    replicator: "foo/bar",
    id: "baz",
    query: {
      limit: 10,
      skip: 10,
    },
  };

  const { spy } = await serverInstance.scheduler().docs(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/_scheduler/_docs/${opts.replicator}/${opts.id}?limit=${
      opts.query!.limit
    }&skip=${opts.query!.skip}`
  );
  t.is(spy.data.options.method, "GET");
});

test("server: searchAnalyze calls POST at /_search_analyze with data params", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts: SearchAnalyzeOptions = {
    data: {
      field: "english",
      text: "running",
    },
  };
  const { spy } = await serverInstance.searchAnalyze(opts);

  t.is(spy.data.uri, `${baseUri}/_search_analyze`);
  t.is(spy.data.options.method, "POST");
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

test("server: reshard read calls GET at /_reshard", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.reshard().read();

  t.is(spy.data.uri, `${baseUri}/_reshard`);
  t.is(spy.data.options.method, "GET");
});

test("server: reshard state read calls GET at /_reshard/state", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const { spy } = await serverInstance.reshard().state().read();

  t.is(spy.data.uri, `${baseUri}/_reshard/state`);
  t.is(spy.data.options.method, "GET");
});

test("server: reshard state update calls PUT at /_reshard/state", async (t) => {
  const serverInstance = server(baseUri);

  request.callsFake(resolveRequest());

  const opts = {
    data: {
      state: "stopped",
      state_reason: "stopped abruptly due to external factors",
    },
  };
  const { spy } = await serverInstance.reshard().state().update(opts);

  t.is(spy.data.uri, `${baseUri}/_reshard/state`);
  t.is(spy.data.options.method, "PUT");
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

resourceGroup("server::reshard", "jobs", "/_reshard/jobs", (message) => {
  test(message("create calls POST"), async (t) => {
    const serverInstance = server(baseUri);
    request.callsFake(resolveRequest());

    const opts: ReshardJobCreateOptions = {
      data: {
        type: "split",
        db: "foo",
        node: "1.1.1.1:5984",
        range: "aaabbb-eeefff",
        shard: "shards/aaabbb-eeefff/baz.1607880978643",
        error: "something went wrong",
      },
    };

    const { spy } = (await serverInstance.reshard().jobs().create(opts)) as any;

    t.is(spy.data.uri, `${baseUri}/_reshard/jobs`);
    t.is(spy.data.options.method, "POST");
    t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
  });
});
