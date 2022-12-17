import 'reflect-metadata';
import {MetadataKeys, Middleware} from '@core/model';

/**
 * Set middleware for the given controller or handler
 * @param middleware
 */
export function Use(middleware: Middleware[]) {
	return function<T>(constructor: { new (...params: unknown[]): T }) {
		Reflect.defineMetadata(MetadataKeys.middleware, middleware, constructor);
	};
}
