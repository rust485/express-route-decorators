import {MetadataKeys, Middleware} from '@model';
import {Service} from 'typedi';

export function Controller(basePath: string, ...middleware: Middleware[]) {
  return function<T>(constructor: { new (...params: any[]): T }) {
    Reflect.defineMetadata(MetadataKeys.basePath, basePath, constructor);
    Reflect.defineMetadata(MetadataKeys.middleware, middleware, constructor);

    Reflect.decorate([Service], constructor);

    ControllerRegistory.registerController(constructor);
  };
}

export class ControllerRegistory {
  static readonly controllers = [];

  static registerController<T>(controller: { new (...params: any[]): T }) {
    this.controllers.push(controller);
  }
}
