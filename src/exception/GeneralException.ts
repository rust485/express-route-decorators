export class GeneralException extends Error {
  constructor(
      err?: string,
      public statusCode?: number,
  ) { super(err); }
}

export function isGeneralException(obj: any): obj is GeneralException {
  return obj.message !== undefined && typeof obj.message === 'string' &&
    obj.statusCode !== undefined && typeof obj.statusCode === 'number';
}
