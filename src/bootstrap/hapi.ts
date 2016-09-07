import { RouteTree } from "../route/tree";

export function bootstrapHapi(server, root: any) {
    const rootTree = RouteTree.for(root);

    if (rootTree.children.length === 0 && rootTree.nodes.length === 0) {
        throw new TypeError("No child routes found for root object.");
    }

    const nodes = rootTree.flatten();
    nodes.forEach(node => {
        server.route({
            path: node.absolutePath,
            method: node.method,
        })
    })
}
