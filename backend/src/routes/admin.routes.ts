import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as booksController from '../controllers/books.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.delete('/books/:id', booksController.deleteBook);

export default router;

