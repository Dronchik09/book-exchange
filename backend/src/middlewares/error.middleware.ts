import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http-error';

export const errorMiddleware = (
  err: HttpError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = (err as HttpError).statusCode || 500;
  const message = err.message || 'Внутрішня помилка сервера';

  if (statusCode === 500) {
    console.error('[Server Error]:', err);
  }

  res.status(statusCode).json({
    message,
  });
};

