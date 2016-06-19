import * as Joi from "joi";

export function Validate(type: string, validation: Joi.ObjectSchema) {
  return function (target: any, key: any, descriptor: any) {
    target[key].route = target[key].route || {};
    let config = target[key].route.config = target[key].route.config || {};
    config.validate = config.validate || {};
    
    if (config.validate[type] != null) {
      config.validate[type] = config.validate[type].concat(validation);
    } else {
      config.validate[type] = validation;
    }
  }
}