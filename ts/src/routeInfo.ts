import * as Hapi from "hapi";

export class RouteInfo {
  public providers: any = {};

  constructor(public req: Hapi.Request, public reply: Hapi.IReply) {
  }

  provide(key: any, value?: any) {
    if (value === undefined) {
      value = key;
      key = key.constructor;
    }
    this.providers[key] = value;
  }

  param(name?: string): any {
    if (name == null) return this.req.params;
    return this.req.params[name];
  }

  payload(name?: string): any {
    if (name == null) return this.req.payload;
    return this.req.payload[name];
  }

  query(name?: string): any {
    if (name == null) return this.req.query;
    return this.req.query[name];
  }

  get auth() {
    return this.req.auth;
  }

  assembleProviders(): any {
    this.provide(this);
    return this.providers;
  }
}
