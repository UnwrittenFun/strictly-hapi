import * as dot from "dot-object";
import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Promise from "bluebird";
import * as _ from "lodash";
import {Injector} from "ts-injectable";
import {RouteInfo} from "./routeInfo";

export function bootstrap(server: Hapi.Server, Route: any, injectables: any[], controllers: any[]) {
  console.info("Compiling and registering routes..");

  let profile = process.env.PROFILE || false;

  let controllerMap = {};

  addInjectables(injectables);
  addControllers(controllerMap, controllers);

  let route = new Route();
  for (let i = 0, len = route.routes.length; i < len; i++) {
    let path = route.routes[i];
    let pathKey = path.split(".").slice(-1).join("");
    let parentPath = path.split(".").slice(0, -1).join(".");
    let parentRoute = route;

    if (parentPath !== "") {
      parentRoute = dot.pick(parentPath, route);
    }

    let handler = dot.pick(path, route);
    let routeConfig = handler.route;
    let types = Reflect.getMetadata("design:paramtypes", parentRoute, pathKey);
    let controllers = routeConfig.controllers || [];
    let scopes = routeConfig.scopes;
    routeConfig.handler = (function (handler, types, controllers) {
      return function (request, reply) {
        if (profile) console.time(request.path + " overall");
        let routeInfo = new RouteInfo(request);

        if (profile) console.time(request.path + " scopes");
        Promise.resolve()
          .then(() => {
            let Project: any = Injector.get("model:auth:Projects");
            if (scopes) {
              if (routeInfo.auth.credentials.scope === "admin") return;

              return Promise
                .props({
                  linkedId: scopes.linked(routeInfo),
                  type: scopes.project(routeInfo)
                })
                .then((res: any) => {
                  return Project
                    .filter({
                      userId: routeInfo.auth.credentials.id,
                      linkedId: res.linkedId,
                      type: res.type
                    })
                })
                .then(projects => {
                  if (projects.length === 0 || (!projects[0].owner && _.intersection(scopes.value, projects[0].scopes).length === 0)) {
                    return Promise.reject(Boom.forbidden(`Missing permission ${scopes.value} on this resource`));
                  }
                });
            }
          }).then(() => {
            if (profile) console.timeEnd(request.path + " scopes");
            if (profile) console.time(request.path + " controllers");
            return Promise
              .each(controllers, function (controller: string) {
                if (profile) console.time(request.path + " controller " + controller);
                let controllerParts = controller.split(".");
                let method = controllerParts.splice(-1)[0];
                let id = controllerParts.join(".");
                let controllerTypes = Reflect.getMetadata("design:paramtypes", controllerMap[id], method);
                return Promise.resolve(controllerMap[id][method].apply(controllerMap[id], Injector.compile(controllerTypes, routeInfo.assembleProviders())))
                  .then(() => {
                    if (profile) console.timeEnd(request.path + " controller " + controller)
                  });
              })
          })
          .then(function () {
            if (profile) console.timeEnd(request.path + " controllers");
            if (profile) console.time(request.path + " handler");
            return handler.apply(this, Injector.compile(types, routeInfo.assembleProviders()))
          })
          .then(function (res) {
            reply(res);
            if (profile) console.timeEnd(request.path + " handler");
            if (profile) console.timeEnd(request.path + " overall");
          })
          .catch(function (err) {
            if (err.isBoom) {
              reply(err);
            } else if (err.statusCode != null) {
              reply(err).code(err.statusCode);
            } else {
              reply(Boom.badImplementation(err.message || err, err));
            }
            if (profile) console.timeEnd(request.path + " handler");
            if (profile) console.timeEnd(request.path + " overall");
          })
      }
    })(handler, types, controllers);

    routeConfig.config = routeConfig.config || {};
    routeConfig.config.validate = routeConfig.config.validate || {};
    for (let i = 0, len = controllers.length; i < len; i++) {
      let controllerParts = controllers[i].split(".");
      let method = controllerParts.splice(-1)[0];
      let id = controllerParts.join(".");
      let controller = controllerMap[id];
      
      if (controller == null) {
        throw new Error(`Controller not found: ${id}`);
      }
      
      if (controller[method].route && controller[method].route.config && controller[method].route.config.validate) {
        let keys = Object.keys(controller[method].route.config.validate);
        for (let j = 0, len = keys.length; j < len; j++) {
          let type = keys[j];
          let validation = controller[method].route.config.validate[type];
          if (routeConfig.config.validate[type] != null) {
            routeConfig.config.validate[type] = routeConfig.config.validate[type].concat(validation);
          } else {
            routeConfig.config.validate[type] = validation;
          }
        }
      }
    }

    routeConfig.config.tags = routeConfig.config.tags || ["api"];

    delete routeConfig.controllers;
    delete routeConfig.scopes;
    console.log(`${styleMethod(routeConfig.method)} ${routeConfig.path}`);
    server.route(routeConfig);
  }
  console.log();
}

function addControllers(controllerMap: any, controllers: any[]) {
  for (let i = 0, len = controllers.length; i < len; i++) {
    let Controller = controllers[i];
    if (Array.isArray(Controller)) {
      addControllers(controllerMap, Controller);
    } else {
      controllerMap[Controller.controllerId] = new Controller();
    }
  }
}

function addInjectables(injectables: any[]) {
  for (let i = 0, len = injectables.length; i < len; i++) {
    let injectable = injectables[i];
    if (Array.isArray(injectable)) {
      addInjectables(injectable);
    } else if (injectable.name != null && injectable.value != null) {
      Injector.provide(injectable.name, injectable.value);
    } else {
      Injector.provide(injectable);
    }
  }
}

let methodColours = {
  "get": 32,
  "delete": 31,
  "put": 36,
  "post": 33
};

function styleMethod(method) {
  method = method.toLowerCase();
  let colour = methodColours[method];
  return (" " as any).repeat(8 - method.length) + "\x1b[1;" + colour + "m" + method + "\x1b[0m";
}
