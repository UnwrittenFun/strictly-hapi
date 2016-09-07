import { RouteTree } from "./tree";
import { joinUrl } from "../util/url";

export class RouteNode {
    parent: RouteTree;
    method: string;
    path: string;
    handler: Function;

    constructor(method: string, path: string, handler: Function = () => {}) {
        this.method = method;
        this.path = path;
        this.handler = handler;
    }

    get absolutePath(): string {
        if (!this.parent) {
            throw new MissingParentError("A route node was not associated with a tree");
        }

        return joinUrl(this.parent.absolutePath, this.path);
    }
}

export class MissingParentError extends Error {
    constructor(message: string) {
        super(`MissingParent: ${message}`);
        this.name = "MissingParent";
    }
}
