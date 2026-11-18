import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import upload from '../middleware/multer.js';
import { createProduct, deleteImageFromCloudinary, deleteProduct, deleteMultipleProducts, getAllProducts, getFeaturedProduct, getProductByCatId, getProductByCatName, getProductByPrice, getProductByRating, getProductBySubCatId, getProductBySubCatName, getProductByThirdSubCatId, getProductByThirdSubCatName, getProductCount, getSingleProduct, updateProduct, uploadImages, filterProducts, searchSuggestions } from '../controllers/productController.js';

const productRouter = Router();

productRouter.post('/upload-images', auth, isAdmin, upload.array('images'), uploadImages);
productRouter.post('/create', auth, isAdmin, createProduct);
productRouter.get('/', getAllProducts);
productRouter.get('/getproductby-catid/:id', getProductByCatId);
productRouter.get('/getproductby-catname', getProductByCatName);
productRouter.get('/getproductby-subcatid/:id', getProductBySubCatId);
productRouter.get('/getproductby-subcatname', getProductBySubCatName);
productRouter.get('/getproductby-thirdsubcatid/:id', getProductByThirdSubCatId);
productRouter.get('/getproductby-thirdsubcatname', getProductByThirdSubCatName);
productRouter.get('/getproductby-price', getProductByPrice);
productRouter.get('/getproductby-rating', getProductByRating);
productRouter.get('/getproductcount', getProductCount);
productRouter.get('/getfeaturedproduct', getFeaturedProduct);
productRouter.delete('/deleteproduct/:id', auth, isAdmin, deleteProduct);
productRouter.get('/getproduct/:id', getSingleProduct);
productRouter.post('/filters', filterProducts);
productRouter.get('/search-suggestions', searchSuggestions);
productRouter.delete('/deleteimage', auth, isAdmin, deleteImageFromCloudinary);
productRouter.put('/updateproduct/:id', auth, isAdmin, updateProduct);
productRouter.post('/delete-multiple', auth, isAdmin, deleteMultipleProducts);

export default productRouter;