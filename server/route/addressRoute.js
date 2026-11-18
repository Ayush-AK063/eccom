import express from 'express';
import auth from '../middleware/auth.js';
import { addAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/addressController.js';

const router = express.Router();

router.post('/add', auth, addAddress);
router.get('/:userId', auth, getAddresses);
router.put('/:id', auth, updateAddress);
router.delete('/:id', auth, deleteAddress);

export default router;
