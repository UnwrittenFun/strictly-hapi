import test from "ava";
import { RouteTree } from "./tree";
import { RouteNode, MissingParentError } from "./node";

test("adds the node to the tree's `nodes` array", t => {
    const tree = new RouteTree("foo");
    const node = new RouteNode("GET", "");

    tree.appendNode(node);

    t.is(tree.nodes[0], node);
});

test("Assigns the node's parent as the tree", t => {
    const tree = new RouteTree("foo");
    const node = new RouteNode("GET", "");

    tree.appendNode(node);

    t.is(node.parent, tree);
});

test("Correctly assigns the method and path", t => {
    const node = new RouteNode("GET", "foo");

    t.is(node.method, "GET");
});

test("assembles the absolute path", t => {
    const tree = new RouteTree("foo");
    const node = new RouteNode("GET", "baz");

    tree.appendNode(node);

    t.is(node.absolutePath, "/foo/baz");
});

test("correctly assembles the absolute path when the parent path is empty", t => {
    const tree = new RouteTree("");
    const node = new RouteNode("GET", "foo");

    tree.appendNode(node);

    t.is(node.absolutePath, "/foo");
});

test("correctly assembles the absolute path when the parent & node path is empty", t => {
    const tree = new RouteTree("");
    const node = new RouteNode("GET", "");

    tree.appendNode(node);

    t.is(node.absolutePath, "/");
});

test("correctly assembles the absolute path through two trees", t => {
    const primaryTree = new RouteTree("foo");
    const secondaryTree = new RouteTree("bar");
    const node = new RouteNode("GET", "baz");

    primaryTree.appendTree(secondaryTree);
    secondaryTree.appendNode(node);

    t.is(node.absolutePath, "/foo/bar/baz");
});

test("calling absolutePath on a node without a parent throws", t => {
    const node = new RouteNode("GET", "foo");
    t.throws(() => node.absolutePath, MissingParentError);
});
