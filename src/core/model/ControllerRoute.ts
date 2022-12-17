import {Method} from './Method';
import {Middleware} from './Middleware';

export interface ControllerRoute {
  method: Method;
  path: string;
  handlerName: string | symbol;
  middleware: Middleware[];
}
