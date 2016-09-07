import { bootstrapHapi } from "./hapi";
import { Route } from "../decorators/route";
import test from "ava";

class MockHapiServer {
    routes: any[] = [];

    route(route: any) {
        this.routes.push(route);
    }
}

test("throws when a root has no children", t => {
    t.throws(() => bootstrapHapi(new MockHapiServer(), {}), "No child routes found for root object.");
});

test("registers routes with the server", t => {
    const server = new MockHapiServer();

    class RootView {
        @Route("get")
        getFoo() {}
    }

    bootstrapHapi(server, new RootView());

    t.is(server.routes.length, 1);
    t.is(server.routes[0].path, "/");
    t.is(server.routes[0].method, "GET");
});

test("correctly registers sub routes", t => {
    const server = new MockHapiServer();

    class FooView {
        @Route("get", "bar")
        getBar() {}
    }

    class RootView {
        @Route("foo")
        get foo () {
            return new FooView();
        }
    }

    bootstrapHapi(server, new RootView());

    t.is(server.routes.length, 1);
    t.is(server.routes[0].path, "/foo/bar");
    t.is(server.routes[0].method, "GET");
});
