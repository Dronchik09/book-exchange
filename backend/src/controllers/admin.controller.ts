import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { createHttpError } from '../utils/http-error';

const parseId = (param: string | string[] | undefined): number => {
  const id = Number(param);
  if (Number.isNaN(id) || id <= 0) {
    throw createHttpError(400, 'Некоректний ID користувача');
  }
  return id;
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.createUserByAdmin(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const user = await adminService.updateUserByAdmin(id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const result = await adminService.deleteUserByAdmin(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

