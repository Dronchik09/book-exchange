import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { createHttpError } from '../utils/http-error';

export interface AuthTokenPayload {
  userId: number;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Необхідна авторизація (відсутній токен)');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'book_exchange_super_secret_jwt_2026';

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) {
      return next(error);
    }
    return next(createHttpError(401, 'Недійсний або прострочений токен'));
  }
};

export const adminMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(createHttpError(403, 'Доступ заборонено: потрібні права адміністратора'));
  }
  next();
};

