import {FileContentMatcher, FileDiscovery, IMatcher} from '@discovery';
import {isGeneralException} from '@exception';
import {HttpRequest, HttpResponse, StatusCode} from '@model';
import {ControllerRoute, MetadataKeys, Middleware} from '@core/model';
import {Reflect} from '@util/Reflect';
import bodyParser from 'body-parser';
import express, {Application, Router} from 'express';
import {Server} from 'http';
import {AddressInfo} from 'net';
import Container from 'typedi';
import {ControllerRegistry} from './ControllerRegistry';
import {ServerState} from './ServerState';

/**
 * Server that handles discovering controllers and forwarding http requests to controller handlers
 */
export abstract class ApiServer {
	protected readonly CONTROLLER_MATCHER: IMatcher = new FileContentMatcher(/@Controller/);
	protected readonly DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

	/**
   * App express object
   */
	protected _app: Application;

	/**
   * Directory to search for controllers in. The default directory is determined by
   * calling `process.cwd()`
   */
	protected _controllerDir: string;

	/**
   * Port number
   */
	protected _port?: number;

	/**
   * Server created from `Application#listen`
   */
	protected _server: Server;

	/**
   * Current state of the server
   */
	protected _state: ServerState;

	constructor(port?: number) {
		this._state = ServerState.UNINITIALIZED;
		this._port = port;

		this._app = express();
	}

	/**
   * Start the server and begin listening for requests
   */
	public async start() {
		if (this._state !== ServerState.UNINITIALIZED) {
			return;
		}

		await this._init();

		this._state = ServerState.STARTING;
		this._server = this._app.listen(this._port, () => {
			this._port = (this._server.address() as AddressInfo).port;
			this._state = ServerState.RUNNING;
			this._afterAppStart();
		});
	}

	/**
   * Terminate the server
   */
	public async stop() {
		this._state = ServerState.TERMINATING;
		this._server.close();
		this._state = ServerState.TERMINATED;
	}

	/**
   * Called after the server begins listening for requests.
   *
   * Does nothing by default
   */
	protected async _afterAppStart() { return; }

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
	protected _handleRequest(handler: (request: HttpRequest, response: HttpResponse) => unknown) {
		return async (req: HttpRequest, res: HttpResponse) => {
			try {
				const result = await handler(req, res);

				res.status(StatusCode.OK).json(result);
			} catch (err) {
				if (isGeneralException(err)) {
					res.status(err.statusCode).json({body: err.body, message: err.message});
				} else {
					res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message: this.DEFAULT_ERROR_MESSAGE});
				}
			}
		};
	}

	/**
   * Initialize resources needed by your server
   * (e.g. initializing database connections)
   *
   * Sets up the json and urlencoded body parsers by default
   */
	protected async _initialize() {
		this._app.use(bodyParser.json());
		this._app.use(bodyParser.urlencoded({extended: true}));
	}

	/**
   * Discover (activate by importing) all controllers
   */
	private _discoverControllers() {
		new FileDiscovery(this.CONTROLLER_MATCHER, this._controllerDir)
			.findFiles();
	}

	private async _init() {
		this._state = ServerState.INITIALIZING;
		this._controllerDir = process.cwd();

		await this._initialize();

		this._discoverControllers();
		this._registerRoutes();

		this._state = ServerState.INITIALIZED;
	}

	/**
   * Initialize request handlers for each discovered controller
   */
	private _registerRoutes() {
		ControllerRegistry.controllers.forEach((controllerClass) => {
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

		this._app.use(basePath, exRouter);
	}
}
