import * as symbols from "../symbols";
import { RouteNode } from "./node";
import { joinUrl } from "../util/url";

export class RouteTree {
    parent?: RouteTree;
    children: RouteTree[] = [];

    path: string;
    nodes: RouteNode[] = [];

    constructor(path: string) {
        this.path = path;
    }

    static for(target: any): RouteTree {
        if (!Reflect.has(target, symbols.routes)) {
            Reflect.set(target, symbols.routes, new RouteTree(""));
        }

        return Reflect.get(target, symbols.routes);
    }

    appendTree(tree: RouteTree) {
        tree.parent = this;
        this.children.push(tree);
    }

    appendNode(node: RouteNode) {
        node.parent = this;
        this.nodes.push(node);
    }

    get absolutePath(): string {
        if (!this.parent) {
            return `/${this.path}`;
        }

        return joinUrl(this.parent.absolutePath, this.path);
    }

    flatten(): RouteNode[] {
        return this.children.map(tree => tree.flatten()).reduce((allNodes, nodes) => [...allNodes, ...nodes], this.nodes);
    }
}
