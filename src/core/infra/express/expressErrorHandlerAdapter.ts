import type { NextFunction, Request, Response } from 'express';
import type { HttpErrorHandler } from '../../application/ports/http/HttpErrorHandler';

export function expressErrorHandlerAdapter(httpErrorHandler: HttpErrorHandler) {
  return (error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(error);
    }

    const { statusCode, body } = httpErrorHandler.handle(error);

    return res.status(statusCode).json(body);
  };
}
