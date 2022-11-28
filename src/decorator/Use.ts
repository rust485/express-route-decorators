import {MetadataKeys, Middleware} from '@model';

/**
 * Set middleware for the given controller or handler
 * @param middleware 
 */
export function Use(middleware: Middleware[]) {
  return function<T>(constructor: { new (...params: any[]): T }) {
    Reflect.defineMetadata(MetadataKeys.middleware, middleware, constructor);
  };
}