import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { addProductSize, getProductSizes, deleteProductSize } from '../controllers/productSizeController.js';

const router = express.Router();

router.post('/create', auth, isAdmin, addProductSize);
router.get('/', getProductSizes);
router.delete('/:id', auth, isAdmin, deleteProductSize);

export default router;
