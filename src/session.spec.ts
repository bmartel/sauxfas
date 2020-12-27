import test from "ava";
import { RequestMethod } from "./request";
import { session } from "./session";
import { request, resolveRequest, resourceGroup } from "./spec.helper";

const baseUri = "http://localhost";

test("session: initializes with a base uri", (t) => {
  t.assert(session(baseUri));
});

resourceGroup("session", "", "/_session", (message, nsUri) => {
  test(message("read calls GET"), async (t) => {
    const sessionInstance = session(baseUri);

    request.callsFake(resolveRequest());

    const { spy } = (await sessionInstance().read({})) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri}`);
    t.is(spy.data.options.method, RequestMethod.Get);
  });

  test(message("read reuse session Cookie"), async (t) => {
    const sessionInstance = session(baseUri);

    request.callsFake(resolveRequest());

    const token = "foo";
    const Cookie = `AuthSession=${token}`;
    const { spy } = (await sessionInstance().read({
      headers: { Cookie },
    })) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri}`);
    t.is(spy.data.options.method, RequestMethod.Get);
    t.is(spy.data.options.headers.Cookie, Cookie);
  });

  test(message("read calls HEAD if method set"), async (t) => {
    const sessionInstance = session(baseUri);

    request.callsFake(resolveRequest());

    const { spy } = (await sessionInstance().read({
      method: RequestMethod.Head,
    })) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri}`);
    t.is(spy.data.options.method, RequestMethod.Head);
  });

  test(message("create calls POST"), async (t) => {
    const sessionInstance = session(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const password = "bar";

    const opts = {
      data: {
        name,
        password,
      },
    };
    const { spy } = (await sessionInstance().create(opts)) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri}`);
    t.is(spy.data.options.method, RequestMethod.Post);
  });

  test(message("destroy calls DELETE"), async (t) => {
    const sessionInstance = session(baseUri);

    request.callsFake(resolveRequest());

    const { spy } = (await sessionInstance().destroy({})) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri}`);
    t.is(spy.data.options.method, RequestMethod.Delete);
  });
});
