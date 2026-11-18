import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { addProductRam, getProductRams, deleteProductRam } from '../controllers/productRamController.js';

const router = express.Router();

router.post('/create', auth, isAdmin, addProductRam);
router.get('/', getProductRams);
router.delete('/:id', auth, isAdmin, deleteProductRam);

export default router;
