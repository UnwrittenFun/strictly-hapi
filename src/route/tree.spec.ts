import test from "ava";
import { RouteTree } from "./tree";
import { RouteNode } from "./node";

test("append assigns parent", t => {
    const primaryTree = new RouteTree("foo");
    const secondaryTree = new RouteTree("bar");

    primaryTree.appendTree(secondaryTree);

    t.is(secondaryTree.parent, primaryTree);
});

test("append adds to the children array", t => {
    const primaryTree = new RouteTree("foo");
    const secondaryTree = new RouteTree("bar");

    primaryTree.appendTree(secondaryTree);

    t.is(primaryTree.children[0], secondaryTree);
});

test("assembles the absolute path", t => {
    const primaryTree = new RouteTree("foo");
    const secondaryTree = new RouteTree("bar");
    const tertiaryTree = new RouteTree("baz");

    primaryTree.appendTree(secondaryTree);
    secondaryTree.appendTree(tertiaryTree);

    t.is(primaryTree.absolutePath, "/foo");
    t.is(secondaryTree.absolutePath, "/foo/bar");
    t.is(tertiaryTree.absolutePath, "/foo/bar/baz");
});

test("correctly assembles the absolute path when the tree path is empty", t => {
    const primaryTree = new RouteTree("");
    const secondaryTree = new RouteTree("");
    const tertiaryTree = new RouteTree("baz");

    primaryTree.appendTree(secondaryTree);
    secondaryTree.appendTree(tertiaryTree);

    t.is(primaryTree.absolutePath, "/");
    t.is(secondaryTree.absolutePath, "/");
    t.is(tertiaryTree.absolutePath, "/baz");
});

test("flatten returns all nodes of child trees", t => {
    const primaryTree = new RouteTree("foo");
    const secondaryTree = new RouteTree("bar");
    const tertiaryTree = new RouteTree("baz");

    primaryTree.appendTree(secondaryTree);
    secondaryTree.appendTree(tertiaryTree);

    const primaryNode = new RouteNode("GET", "primary");
    const secondaryNode = new RouteNode("GET", "secondary");
    const tertiaryNode = new RouteNode("GET", "tertiary");

    primaryTree.appendNode(primaryNode);
    secondaryTree.appendNode(secondaryNode);
    tertiaryTree.appendNode(tertiaryNode);

    const flattened = primaryTree.flatten();

    t.is(flattened[0], primaryNode);
    t.is(flattened[1], secondaryNode);
    t.is(flattened[2], tertiaryNode);
});
