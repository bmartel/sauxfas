import test from "ava";
import { db } from "./db";
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
      },
    };
    const { spy } = await dbInstance(name).create(opts);

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace("{db}", name)}?q=${opts.query.q}&n=${
        opts.query.n
      }&partitioned=${opts.query.partitioned}`
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

// ALL_DOCS
// DESIGN_DOCS
// BULK_GET
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
