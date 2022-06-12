import { MetadataKeys, Middleware } from "@model";

export function Use(middleware: Middleware[]) {
  return function<T>(constructor: { new (...params: any[]): T }) {
    Reflect.defineMetadata(MetadataKeys.middleware, middleware, constructor);
  };
}
