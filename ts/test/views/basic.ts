import {Get, Validate, RouteInfo, Pre} from "../../";
import {Inject} from "ts-injectable";
import * as Joi from "joi";

export class BasicView {
  @Get()
  getNoArgs() {
    return "Success!";
  }

  @Get("/with/path")
  getWithPath() {
    return "Success!";
  }

  @Get("/validate")
  @Validate("query", Joi.object({
    name: Joi.string().required()
  }))
  validateQuery() {
    return "Success!";
  }

  @Get("/routeInfo")
  injectRouteInfo(routeInfo: RouteInfo) {
    return routeInfo.query();
  }
  
  @Get("/controller")
  @Pre("basic.get")
  getFromController(@Inject("result") result: any) {
    return result; 
  }
  
  @Get("/controller/wait")
  @Pre("basic.wait")
  waitFromController(@Inject("result") result: any) {
    return result; 
  }
}