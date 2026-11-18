import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { addProductWeight, getProductWeights, deleteProductWeight } from '../controllers/productWeightController.js';

const router = express.Router();

router.post('/create', auth, isAdmin, addProductWeight);
router.get('/', getProductWeights);
router.delete('/:id', auth, isAdmin, deleteProductWeight);

export default router;
