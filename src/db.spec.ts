import test from "ava";
import { db } from "./db";
import { DesignDocOptions, DesignDocQueryOptions } from "./doc";
import { MultipleQueryOptions } from "./internal";
import { RequestMethod } from "./request";
import { request, resolveRequest, resourceGroup } from "./spec.helper";

const baseUri = "http://localhost";

test("db: initializes with a base uri", (t) => {
  t.assert(db(baseUri));
});

resourceGroup("db", "", "/{db}", (message, nsUri) => {
  test(message("read calls GET with name"), async (t) => {
    const dbInstance = db(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const { spy } = await dbInstance(name).read();

    t.is(spy.data.uri, `${baseUri}${nsUri.replace("{db}", name)}`);
    t.is(spy.data.options.method, RequestMethod.Get);
  });

  test(message("read calls HEAD with name if method set"), async (t) => {
    const dbInstance = db(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const { spy } = await dbInstance(name).read({ method: RequestMethod.Head });

    t.is(spy.data.uri, `${baseUri}${nsUri.replace("{db}", name)}`);
    t.is(spy.data.options.method, RequestMethod.Head);
  });

  test(message("create calls PUT with name"), async (t) => {
    const dbInstance = db(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";

    const opts = {
      query: {
        q: 8,
        n: 3,
        partitioned: false,
        batch_mode: true,
      },
    };
    const { spy } = await dbInstance(name).create(opts);

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace("{db}", name)}?q=${opts.query.q}&n=${
        opts.query.n
      }&partitioned=${opts.query.partitioned}&batch_mode=${
        opts.query.batch_mode
      }`
    );
    t.is(spy.data.options.method, RequestMethod.Put);
  });

  test(message("destroy calls DELETE with name"), async (t) => {
    const dbInstance = db(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const { spy } = await dbInstance(name).destroy();

    t.is(spy.data.uri, `${baseUri}${nsUri.replace("{db}", name)}`);
    t.is(spy.data.options.method, RequestMethod.Delete);
  });
});

test("db: allDocs read calls GET at /{db}/_all_docs", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";

  const opts = {
    query: {
      keys: ["a", "b", "c"],
      limit: 10,
      skip: 10,
    },
  };
  const { spy } = await dbInstance(name).allDocs().read(opts);

  t.is(
    spy.data.uri,
    `${baseUri}/${name}/_all_docs?keys=${encodeURIComponent(
      opts.query.keys as any
    )}&limit=${opts.query.limit}&skip=${opts.query.skip}`
  );
  t.is(spy.data.options.method, RequestMethod.Get);
});

test("db: allDocs queries calls GET at /{db}/_all_docs/queries", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";
  const opts: MultipleQueryOptions = {
    data: {
      queries: [
        {
          keys: ["a", "b", "c"],
        },
        {
          limit: 10,
          skip: 10,
        },
      ],
    },
  };
  const { spy } = await dbInstance(name).allDocs().queries(opts);

  t.is(spy.data.uri, `${baseUri}/${name}/_all_docs/queries`);
  t.is(spy.data.options.method, RequestMethod.Post);
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

test("db: designDocs read calls GET at /{db}/_design_docs", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";
  const opts: DesignDocOptions = {
    query: {
      keys: ["a", "b", "c"],
      limit: 10,
      skip: 10,
    },
  };
  const { spy } = (await dbInstance(name).designDocs().read(opts)) as any;

  t.is(
    spy.data.uri,
    `${baseUri}/${name}/_design_docs?keys=${encodeURIComponent(
      opts.query!.keys as any
    )}&limit=${opts.query!.limit}&skip=${opts.query!.skip}`
  );
  t.is(spy.data.options.method, RequestMethod.Get);
});

test("db: designDocs queries calls GET at /{db}/_design_docs/queries", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";
  const opts: MultipleQueryOptions<DesignDocQueryOptions> = {
    data: {
      queries: [
        {
          keys: ["a", "b", "c"],
        },
        {
          limit: 10,
          skip: 10,
        },
      ],
    },
  };
  const { spy } = await dbInstance(name).designDocs().queries(opts);

  t.is(spy.data.uri, `${baseUri}/${name}/_design_docs/queries`);
  t.is(spy.data.options.method, RequestMethod.Post);
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

test("db: bulkGet calls GET at /{db}/_bulk_get", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";
  const opts = {
    query: {
      revs: true,
    },
  };
  const { spy } = (await dbInstance(name).bulkGet(opts)) as any;

  t.is(spy.data.uri, `${baseUri}/${name}/_bulk_get?revs=${opts.query.revs}`);
  t.is(spy.data.options.method, RequestMethod.Get);
});

test("db: bulkDocs calls POST at /{db}/_bulk_docs", async (t) => {
  const dbInstance = db(baseUri);

  request.callsFake(resolveRequest());

  const name = "foo";
  const opts = {
    data: {
      docs: [
        {
          _id: "foo",
          _rev: "bar",
          name: "baz",
        },
        {
          _id: "abc",
          _rev: "123",
          name: "easy",
        },
      ],
    },
  };
  const { spy } = (await dbInstance(name).bulkDocs(opts)) as any;

  t.is(spy.data.uri, `${baseUri}/${name}/_bulk_docs`);
  t.is(spy.data.options.method, RequestMethod.Post);
  t.deepEqual(JSON.parse(spy.data.options.body), opts.data);
});

// FIND
// INDEX
// EXPLAIN
// SHARDS
// SHARDS/DOC
// SYNC_SHARDS
// CHANGES
// COMPACT
// COMPACT/DESIGN_DOC
// ENSURE_FULL_COMMIT
// VIEW_CLEANUP
// SECURITY
// PURGE
// PURGED_INFOS_LIMIT
// MISSING_REVS
// REVS_DIFF
// REVS_LIMIT
