import { isGeneralException } from '@exception';
import { ControllerRoute, MetadataKeys, Middleware } from '@model';
import express, {Application, Request, Response, Router} from 'express';
import Container from 'typedi';

abstract class ApiServer {
  public readonly instance: Application;

  constructor(port?: number) {
    this.instance = express();

    this._registerRoutes();

    this.initialize();

    this.instance.listen(port, () => this.afterAppStart());
  }

  /**
   * Initialize resources needed by your server (e.g. initializing database connections)
   * 
   * Does nothing by default
   */
  public initialize(): void { }

  /**
   * Called after the server begins listening for requests.
   * 
   * Does nothing by default
   */
  public afterAppStart(): void { }

  /**
   * Handles requests by calling the given handler. 
   *   No Errors: This method will return a 200 message with the handler result as JSON
   *   Errors: For exceptions typed like `GeneralException`, the exception status code will be used along with the error message in the json body
   *           For exceptions not type liked `GeneralException`, 500 will be returned with a default message
   * 
   * 
   * Override this if you need different functionality.
   * @param handler 
   */
  protected _handleRequest(handler: (req: Request, res: Response) => any) {
    return async (req: Request, res: Response) => {
      try {
        const result = await handler(req, res);

        res.status(200).json(result);
      } 
      catch (err) {
        if (isGeneralException(err)) {
          res.status(err.statusCode).json({message: err.message});
        } 
        else {
          res.status(500).json({message: 'An unexpected error occurred'});
        }
      }
    }
  }

  private _registerRoutes() {
    // TODO
    [].forEach((controllerClass) => {
      //controllers.forEach((controllerClass) => {
      const controllerInstance = Container.get(controllerClass);

      const basePath: string = Reflect.getMetadata(MetadataKeys.basePath, controllerClass);
      const baseMiddleware: Middleware[] = Reflect.getMetadata(MetadataKeys.middleware, controllerClass);
      const routes: ControllerRoute[] = Reflect.getMetadata(MetadataKeys.routes, controllerClass);

      const exRouter = express.Router();

      this._setupController(exRouter, controllerInstance, basePath, baseMiddleware, routes);
    });
  }

  private _setupController(exRouter: Router, controllerInstance: unknown, basePath: string, baseMiddleware: Middleware[], routes: ControllerRoute[])
  {
    routes.forEach(({ method, path, middleware, handlerName }) =>
    {
      const handler = controllerInstance[String(handlerName)].bind(controllerInstance);
      const routeMiddleware = [...baseMiddleware, ...middleware];

      return exRouter[method](path, this._handleRequest(handler), routeMiddleware);
    });

    this.instance.use(basePath, exRouter);
  }
}

export default ApiServer;
