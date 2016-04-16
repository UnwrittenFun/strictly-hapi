import "reflect-metadata";
import * as Hapi from "hapi";
import {bootstrap} from "../";

import {AllViews} from "./views";
import {controllers} from "./controllers";

export const server = new Hapi.Server({ debug: false });
server.connection({ port: "3000" });

bootstrap(server, AllViews, [], controllers);

server.register([
  {register: require("inject-then")},
], function () {
  server.start(err => {
    if (err) {
      throw err;
    }
  })
});