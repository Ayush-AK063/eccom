import express from 'express';
import { addHomeSlide, getHomeSlides, deleteHomeSlide, uploadImages, deleteMultipleHomeSlides, updateHomeSlide } from '../controllers/homeSlideController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-images', upload.array('images'), uploadImages);
router.post('/create', addHomeSlide);
router.get('/', getHomeSlides);
router.delete('/:id', deleteHomeSlide);
router.put('/:id', updateHomeSlide);
router.post('/delete-multiple', deleteMultipleHomeSlides);

export default router;
