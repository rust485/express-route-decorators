import {isGeneralException} from '@exception';
import {ControllerRoute, MetadataKeys, Middleware} from '@model';
import express, {Application, Request, Response, Router} from 'express';
import Container from 'typedi';
import fs from 'fs';
import path from 'path';
import {ControllerRegistory} from '@decorator';

abstract class ApiServer {
  public readonly instance: Application;

  constructor(port?: number) {
    this.instance = express();

    this._discoverControllers();
    this._registerRoutes();

    this.initialize();

    this.instance.listen(port, () => this.afterAppStart());
  }

  /**
   * Initialize resources needed by your server
   * (e.g. initializing database connections)
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
   * Handles requests by calling the given handler and converts the result
   * into a valid http response with the result as the json body.
   *
   * If a `GeneralException` is thrown, the statusCode and message will
   * be returned.
   *
   * If an Error is caught that does not implement the GeneralException
   * interface, a default message will be returned with status of 500
   *
   * Override this if you need different functionality.
   * @param handler
   */
  protected _handleRequest(handler: (req: Request, res: Response) => any) {
    return async (req: Request, res: Response) => {
      try {
        const result = await handler(req, res);

        res.status(200).json(result);
      } catch (err) {
        if (isGeneralException(err)) {
          res.status(err.statusCode).json({message: err.message});
        } else {
          res.status(500).json({message: 'An unexpected error occurred'});
        }
      }
    };
  }

  private _discoverControllers() {
    const projectRootDir = path.dirname(require.main.filename);

    const controllerSuffix = 'controller.ts';
    const controllerFolder: string = `${projectRootDir}/controllers`;

    const targetPattern = `*.${controllerSuffix}`;

    this._discoverControllersRec(controllerFolder, controllerSuffix);
  }

  private _discoverControllersRec(path: string, targetPattern: string) {
    const children = fs.readdirSync(path);

    children.forEach((child) => {
      if (fs.lstatSync(child).isDirectory()) {
        this._discoverControllersRec(path, targetPattern);
        return;
      }

      if (child.match(targetPattern)) {
        require(child);
      }
    });
  }

  private _registerRoutes() {
    ControllerRegistory.controllers.forEach((controllerClass) => {
      const controllerInstance = Container.get(controllerClass);

      const basePath: string = Reflect.getMetadata(MetadataKeys.basePath, controllerClass);
      const baseMiddleware: Middleware[] = Reflect.getMetadata(MetadataKeys.middleware, controllerClass);
      const routes: ControllerRoute[] = Reflect.getMetadata(MetadataKeys.routes, controllerClass);

      // eslint-disable-next-line new-cap
      const exRouter = express.Router();

      this._setupController(exRouter, controllerInstance, basePath, baseMiddleware, routes);
    });
  }

  private _setupController(exRouter: Router, controllerInstance: unknown, basePath: string, baseMiddleware: Middleware[], routes: ControllerRoute[]) {
    routes.forEach(({method, path, middleware, handlerName}) => {
      const handler = controllerInstance[String(handlerName)].bind(controllerInstance);
      const routeMiddleware = [...baseMiddleware, ...middleware];

      return exRouter[method](path, this._handleRequest(handler), routeMiddleware);
    });

    this.instance.use(basePath, exRouter);
  }
}

export default ApiServer;
