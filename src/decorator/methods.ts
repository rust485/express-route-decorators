import 'reflect-metadata';
import {ControllerRoute, MetadataKeys, Method, Middleware} from '@model';

/**
 * Decorator for GET requests.
 * IMPORTANT: The containing class must be declared with the `@Controller` decorator
 * @param path path to apply the handler to
 * @param middleware list of middleware to apply to this handler
 */
export const Get = methodDecoratorFactory(Method.get);

/**
 * Decorator for PUT requests
 * IMPORTANT: The containing class must be declared with the `@Controller` decorator
 * @param path path to apply the handler to
 * @param middleware list of middleware to apply to this handler
 */
export const Put = methodDecoratorFactory(Method.put);

/**
 * Decorator for POST requests
 * IMPORTANT: The containing class must be declared with the `@Controller` decorator
 * @param path path to apply the handler to
 * @param middleware list of middleware to apply to this handler
 */
export const Post = methodDecoratorFactory(Method.post);

/**
 * Decorator for DELETE requests
 * IMPORTANT: The containing class must be declared with the `@Controller` decorator
 * @param path path to apply the handler to
 * @param middleware list of middleware to apply to this handler
 */
export const Delete = methodDecoratorFactory(Method.delete);


function methodDecoratorFactory(method: Method) {
  return (path: string, middleware: Middleware[] = []): MethodDecorator => {
    return (target, propertyKey) => {
      // get routes so far created for the method's controller
      const routes = getControllerRoutes(target.constructor);

      // push new route to list of existing routes
      routes.push({method, path, handlerName: propertyKey, middleware});
    };
  };
}

function getControllerRoutes(controllerCtor: Function): ControllerRoute[] {
  if (!Reflect.hasMetadata(MetadataKeys.routes, controllerCtor)) {
    Reflect.defineMetadata(MetadataKeys.routes, [], controllerCtor);
  }

  return Reflect.getMetadata(MetadataKeys.routes, controllerCtor);
}
