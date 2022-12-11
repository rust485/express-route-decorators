export class GeneralException extends Error {
	constructor(
    public statusCode: number,
		message?: string,
		public body?: unknown
	) {
		super(message);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isGeneralException(obj: any): obj is GeneralException {
	return typeof obj === 'object' && typeof obj.statusCode === 'number';
}