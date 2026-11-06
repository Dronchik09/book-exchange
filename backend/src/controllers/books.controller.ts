import { Request, Response, NextFunction } from 'express';
import * as booksService from '../services/books.service';
import { createHttpError } from '../utils/http-error';

const parseId = (param: string | string[] | undefined): number => {
  const id = Number(param);
  if (Number.isNaN(id) || id <= 0) {
    throw createHttpError(400, 'Некоректний ID книги');
  }
  return id;
};

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, sort, page, limit } = req.query;
    const result = await booksService.getAllBooks({
      search: typeof search === 'string' ? search : undefined,
      sort:
        sort === 'desc' || sort === 'newest' || sort === 'asc'
          ? sort
          : 'asc',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const book = await booksService.getBookById(id);
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const getMyBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await booksService.getUserBooks(req.user!.userId);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await booksService.createBook(req.user!.userId, req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const book = await booksService.updateBook(
      id,
      req.user!.userId,
      req.user!.role,
      req.body
    );
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const result = await booksService.deleteBook(id, req.user!.userId, req.user!.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const requestExchange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const result = await booksService.requestBookExchange(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateExchangeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = parseId(req.params.requestId);
    const result = await booksService.updateExchangeStatus(
      requestId,
      req.user!.userId,
      req.body
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

