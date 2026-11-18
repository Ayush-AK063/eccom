import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { addHomeSlide, getHomeSlides, deleteHomeSlide, uploadImages, deleteMultipleHomeSlides, updateHomeSlide } from '../controllers/homeSlideController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-images', auth, isAdmin, upload.array('images'), uploadImages);
router.post('/create', auth, isAdmin, addHomeSlide);
router.get('/', getHomeSlides);
router.delete('/:id', auth, isAdmin, deleteHomeSlide);
router.put('/:id', auth, isAdmin, updateHomeSlide);
router.post('/delete-multiple', auth, isAdmin, deleteMultipleHomeSlides);

export default router;
