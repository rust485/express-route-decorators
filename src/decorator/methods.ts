import { ControllerRoute, MetadataKeys, Method, Middleware } from '@model';

export const Get    = methodDecoratorFactory(Method.get);
export const Put    = methodDecoratorFactory(Method.put);
export const Post   = methodDecoratorFactory(Method.post);
export const Delete = methodDecoratorFactory(Method.delete);



function methodDecoratorFactory(method: Method) {
  return (path: string, middleware: Middleware[] = []): MethodDecorator => {
    return (target, propertyKey) => {
      // get routes so far created for the method's controller
      const routes = getControllerRoutes(target.constructor);

      // push new route to list of existing routes
      routes.push({ method, path, handlerName: propertyKey, middleware });
    };
  };
}

function getControllerRoutes(controllerCtor: Function): ControllerRoute[] {
  if (!Reflect.hasMetadata(MetadataKeys.routes, controllerCtor)) {
    Reflect.defineMetadata(MetadataKeys.routes, [], controllerCtor);
  }

  return Reflect.getMetadata(MetadataKeys.routes, controllerCtor);
}