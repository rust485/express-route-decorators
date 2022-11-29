import {MetadataKeys, Middleware} from '@model';
import {Service} from 'typedi';
import { ControllerRegistry } from '@core';
import { Reflect } from '@util/Reflect';

/**
 * Decorator to be applied to a class containing route endpoints
 * @param basePath path applied to the front of all routes contained within the controller class
 * @param middleware list of middleware to apply to all routes in the controller
 */
export function Controller(basePath: string, ...middleware: Middleware[]) {
  return function<T>(constructor: { new (...params: any[]): T }) {
    Reflect.defineMetadata(MetadataKeys.basePath, basePath, constructor);
    Reflect.defineMetadata(MetadataKeys.middleware, middleware, constructor);

    Service()(constructor);

    ControllerRegistry.registerController(constructor);
  };
}


