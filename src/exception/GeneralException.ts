export class GeneralException extends Error {
	constructor(
		err?: string,
      public statusCode?: number,
	) {
		super(err);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isGeneralException(obj: any): obj is GeneralException {
	return typeof obj === 'object' && obj.message !== undefined && typeof obj.message === 'string' &&
    obj.statusCode !== undefined && typeof obj.statusCode === 'number';
}