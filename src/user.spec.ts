import test from "ava";
import { RequestMethod } from "./request";
import { request, resolveRequest, resourceGroup } from "./spec.helper";
import { users } from "./user";

const baseUri = "http://localhost";

test("users: initializes with a base uri", (t) => {
  t.assert(users(baseUri));
});

resourceGroup("users", "", "/_users/{id}", (message, nsUri) => {
  test(message("read calls GET with name"), async (t) => {
    const usersInstance = users(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const { spy } = (await usersInstance().read({ query: { name } })) as any;

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace(
        "{id}",
        `org.couchdb.user:${name}`
      )}?name=${name}`
    );
    t.is(spy.data.options.method, RequestMethod.Get);
  });

  test(message("read calls HEAD with name if method set"), async (t) => {
    const usersInstance = users(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const { spy } = (await usersInstance().read({
      method: RequestMethod.Head,
      query: { name },
    })) as any;

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace(
        "{id}",
        `org.couchdb.user:${name}`
      )}?name=${name}`
    );
    t.is(spy.data.options.method, RequestMethod.Head);
  });

  test(message("create calls PUT with name"), async (t) => {
    const usersInstance = users(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const password = "bar";

    const opts = {
      query: {
        name,
      },
      data: {
        name,
        password,
      },
    };
    const { spy } = (await usersInstance().create(opts)) as any;

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace(
        "{id}",
        `org.couchdb.user:${name}`
      )}?name=${name}`
    );
    t.is(spy.data.options.method, RequestMethod.Put);
  });

  test(message("update calls PUT with name, id or rev"), async (t) => {
    const usersInstance = users(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const id = `org.couchdb.user:${name}`;
    const rev = "2-1a";
    const password = "bar";

    const opts = {
      id,
      rev,
      data: {
        name,
        password,
      },
    };
    const { spy } = (await usersInstance().update(opts)) as any;

    t.is(
      spy.data.uri,
      `${baseUri}${nsUri.replace(
        "{id}",
        `org.couchdb.user:${name}`
      )}?rev=${rev}`
    );
    t.is(spy.data.options.method, RequestMethod.Put);
  });

  test(message("destroy calls DELETE with name"), async (t) => {
    const usersInstance = users(baseUri);

    request.callsFake(resolveRequest());

    const name = "foo";
    const id = `org.couchdb.user:${name}`;

    const { spy } = (await usersInstance().destroy({ id })) as any;

    t.is(spy.data.uri, `${baseUri}${nsUri.replace("{id}", id)}`);
    t.is(spy.data.options.method, RequestMethod.Delete);
  });
});
