import * as dot from "dot-object";
import * as _ from "lodash";
import {RouteInfo} from "./routeInfo";

export function Views(basePath: string) {
  return function (target: any, key: string, descriptor: any) {
    target.routes = target.routes || [];

    let routes = descriptor.get.call(target);
    for (let i = 0, len = routes.routes.length; i < len; i++) {
      let route = routes.routes[i];
      target.routes.push(`${key}.${route}`);

      let routeInfo = dot.pick(route, routes).route;
      routeInfo.path = basePath + routeInfo.path;
    }
    return target;
  }
}

export function View(method: string, route?: string) {
  return function (target: any, key: string, descriptor: any) {
    target.routes = target.routes || [];
    target.routes.push(key);

    target[key].route = target[key].route || {};
    target[key].route["method"] = method;
    target[key].route["path"] = route;
    return descriptor;
  }
}

export function Pre(...controllerIds: string[]) {
  return function (target: any, key: string, descriptor: any) {
    target[key].route = target[key].route || {};
    target[key].route.controllers = (target[key].route.controllers || []).concat(controllerIds);
    return descriptor;
  }
}

export function Auth(type: any, required: boolean = true) {
  return function (target: any, key: string, descriptor: any) {
    target[key].route = target[key].route || {};
    target[key].route.config = target[key].route.config || {};
    target[key].route.config.auth = {
      strategy: type,
      mode: required ? "required" : "optional"
    };
    return descriptor;
  }
}

export function Get(route: string = "") {
  return View("GET", route);
}

export function Post(route: string = "") {
  return View("POST", route);
}

export function Put(route: string = "") {
  return View("PUT", route);
}

export function Delete(route: string = "") {
  return View("DELETE", route);
}

interface IScope {
  (project: string, linkedId: any, ...scopes: string[]): any;
  from(type: string, param: string);
}

let ScopeFunction: any = function (project: any, linked: any, ...scopes: string[]) {
  return function (target: any, key: string, descriptor: any) {
    target[key].route = target[key].route || {};
    target[key].route.scopes = {
      project: _.isFunction(project) ? project : () => project,
      linked: _.isFunction(linked) ? linked : () => linked,
      value: scopes
    };
    return descriptor;
  }
};

ScopeFunction.from = function (type: string, param: string) {
  return function (route: RouteInfo) {
    return route[type](param);
  }
};

export var Scope: IScope = ScopeFunction as IScope;
