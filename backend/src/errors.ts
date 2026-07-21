export class AppError extends Error {
  public statusCode: number;

  constructor(arg1: number | string, arg2?: string | number) {
    let statusCode: number;
    let message: string;

    if (typeof arg1 === 'string') {
      message = arg1;
      statusCode = typeof arg2 === 'number' ? arg2 : 500;
    } else {
      statusCode = arg1;
      message = typeof arg2 === 'string' ? arg2 : 'Internal Server Error';
    }

    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
