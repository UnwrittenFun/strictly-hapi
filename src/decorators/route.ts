import * as symbols from "../symbols";
import { RouteNode } from "../route/node";
import { RouteTree } from "../route/tree";

export function Route(method: string = "", path: string = "") {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const rootTree = RouteTree.for(target);

        // We are working on an accessor, not a method.
        if (descriptor["get"]) {
            path = method;
            method = null;

            const tree: RouteTree = Reflect.get(descriptor.get(), symbols.routes);
            tree.path = path;
            rootTree.appendTree(tree);
            return;
        }

        const node = new RouteNode(method.toUpperCase(), path);
        rootTree.appendNode(node);
    }
}

export function Get(path: string = "") {
    return Route("GET", path);
}

export function Put(path: string = "") {
    return Route("PUT", path);
}

export function Post(path: string = "") {
    return Route("POST", path);
}

export function Patch(path: string = "") {
    return Route("PATCH", path);
}

export function Delete(path: string = "") {
    return Route("DELETE", path);
}
