import { RouteTree } from "../route/tree";
import { Server } from "hapi";

export function bootstrapHapi(server: Server, root: any) {
    const rootTree = RouteTree.for(root);

    if (rootTree.children.length === 0 && rootTree.nodes.length === 0) {
        throw new TypeError("No child routes found for root object.");
    }

    const nodes = rootTree.flatten();
    nodes.forEach(node => {
        server.route({
            path: node.absolutePath,
            method: node.method,
            handler: (req, reply) => {
                const res = node.handler(req, reply); // TODO: dependency injection
                Promise.resolve(res).then(reply);
            },
        })
    })
}
