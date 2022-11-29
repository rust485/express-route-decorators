export class ControllerRegistry {
  static readonly controllers = [];

  static registerController<T>(controller: { new (...params: any[]): T }) {
    this.controllers.push(controller);
  }
}