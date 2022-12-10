export class ControllerRegistry {
	static readonly controllers = [];

	static registerController<T>(controller: { new (...params: unknown[]): T }) {
		this.controllers.push(controller);
	}
}
