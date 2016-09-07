import { RouteTree } from "./tree";
import { joinUrl } from "../util/url";

export class RouteNode {
    parent: RouteTree;
    method: string;
    path: string;

    constructor(method: string, path: string) {
        this.method = method;
        this.path = path;
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
