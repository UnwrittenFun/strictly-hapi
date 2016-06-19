import {Controller, RouteInfo} from "../../";
import * as Promise from "bluebird";
import {Injectable} from "ts-injectable";

@Controller("basic")
export class BasicController {
  @Injectable
  get(routeInfo: RouteInfo) {
    routeInfo.provide("result", "Hello from BasicController");
  }

  @Injectable
  wait(routeInfo: RouteInfo) {
    return Promise
      .delay(100)
      .then(() => routeInfo.provide("result", "Hello from BasicController"));
  }
}