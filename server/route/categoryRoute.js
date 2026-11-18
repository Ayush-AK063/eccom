import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { createCategory, deleteCategory, deleteImageFromCloudinary, getAllCategories, getCategoryById, getCategoryCount, getSubCategoryCount, updateCategory, uploadImages, deleteMultipleCategories } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';

const categoryRouter = Router();

categoryRouter.post('/upload-images', auth, isAdmin, upload.array('images'), uploadImages);
categoryRouter.post('/createcat', auth, isAdmin, createCategory);
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/get/count', getCategoryCount);
categoryRouter.get('/get/count/subcat', getSubCategoryCount);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.delete('/deleteimage', auth, isAdmin, deleteImageFromCloudinary);
categoryRouter.post('/bulk-delete', auth, isAdmin, deleteMultipleCategories);
categoryRouter.delete('/:id', auth, isAdmin, deleteCategory);
categoryRouter.put('/:id', auth, isAdmin, updateCategory);




export default categoryRouter;