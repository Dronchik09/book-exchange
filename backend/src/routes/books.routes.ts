import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', booksController.getBooks);
router.get('/my', authMiddleware, booksController.getMyBooks);
router.get('/:id', booksController.getBookById);

router.post('/', authMiddleware, booksController.createBook);
router.patch('/:id', authMiddleware, booksController.updateBook);
router.delete('/:id', authMiddleware, booksController.deleteBook);
router.post('/:id/exchange', authMiddleware, booksController.requestExchange);
router.patch('/exchange/:requestId/status', authMiddleware, booksController.updateExchangeStatus);

export default router;

