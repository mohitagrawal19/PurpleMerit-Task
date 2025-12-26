export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const catchAsync = (fn: Function) => {
  return (...args: any[]) => {
    return Promise.resolve(fn(...args)).catch(args[2]);
  };
};
