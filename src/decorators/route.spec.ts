import test from "ava";
import { Route, Get, Delete, Patch, Post, Put } from "./route";
import * as symbols from "../symbols";
import { RouteTree } from "../route/tree";

const FAKE_METHOD_DESCRIPTOR = {
    value: () => {},
};

const FAKE_ACCESSOR_DESCRIPTOR = res => ({
    get() {
        return res;
    }
});

test("creates a route tree if none exists", t => {
    const target = {};
    Route("GET", "")(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const tree: RouteTree = Reflect.get(target, symbols.routes);
    t.truthy(tree);
    t.is(tree.nodes.length, 1);
});

test("doesn't overwrite existing trees", t => {
    const expectedTree = new RouteTree("");
    const target = { [symbols.routes]: expectedTree };
    Route("GET", "")(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const actualTree = Reflect.get(target, symbols.routes);
    t.is(actualTree, expectedTree);
});

test("adds a node with the given details", t => {
    const target = {};
    Route("GET", "foo/bar")(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const tree: RouteTree = Reflect.get(target, symbols.routes);
    const node = tree.nodes[0];
    t.is(node.method, "GET");
    t.is(node.path, "foo/bar");
    t.is(node.parent, tree);
});

test("defaults path to an empty string", t => {
    const target = {};
    Route("GET")(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const tree: RouteTree = Reflect.get(target, symbols.routes);
    const node = tree.nodes[0];
    t.is(node.path, "");
});

test("route aliases work", t => {
    const target = {};

    Get()(target, "foo", FAKE_METHOD_DESCRIPTOR);
    Put()(target, "foo", FAKE_METHOD_DESCRIPTOR);
    Post()(target, "foo", FAKE_METHOD_DESCRIPTOR);
    Patch()(target, "foo", FAKE_METHOD_DESCRIPTOR);
    Delete()(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const tree: RouteTree = Reflect.get(target, symbols.routes);
    const nodes = tree.nodes;

    t.is(nodes[0].method, "GET");
    t.is(nodes[1].method, "PUT");
    t.is(nodes[2].method, "POST");
    t.is(nodes[3].method, "PATCH");
    t.is(nodes[4].method, "DELETE");
});

test("it normalises method names", t => {
    const target = {};
    Route("get")(target, "foo", FAKE_METHOD_DESCRIPTOR);

    const tree: RouteTree = Reflect.get(target, symbols.routes);
    const node = tree.nodes[0];
    t.is(node.method, "GET");
});

test("appends a tree if applied to a property", t => {
    const target = { foo: {} };
    const targetFoo = { [symbols.routes]: new RouteTree("") };
    Route("foo")(target, "foo", FAKE_ACCESSOR_DESCRIPTOR(targetFoo));

    const rootTree: RouteTree = Reflect.get(target, symbols.routes);
    const fooTree: RouteTree = Reflect.get(targetFoo, symbols.routes);

    t.truthy(fooTree);
    t.is(rootTree.children[0], fooTree);
    t.is(fooTree.parent, rootTree);
    t.is(fooTree.path, "foo");
});

test("the decorators work on a class", t => {
    class Bar {
        @Route("GET", "bar")
        getBar() {}
    }

    class Foo {
        @Route("foo")
        get bar() {
            return new Bar();
        }

        @Route("GET")
        getFoo() {}
    }

    const foo = new Foo();
    const fooTree: RouteTree = Reflect.get(foo, symbols.routes);

    t.truthy(fooTree);
    t.is(fooTree.nodes.length, 1);
    t.is(fooTree.children.length, 1);

    const barTree: RouteTree = fooTree.children[0];
    t.true(barTree instanceof RouteTree);
    t.is(barTree.parent, fooTree);
    t.is(barTree.nodes.length, 1);
    t.is(barTree.nodes[0].absolutePath, "/foo/bar")
});
