import express from 'express'
import auth from '../middlewares/auth.js'
import errorHandler from '../services/catchAsync.js'
import productController from '../controllers/productController.js'
import { singleUpload } from '../middlewares/multer.js'

const router = express.Router()

// //Routes here
router.route("/")
.post(auth.adminOnly, singleUpload, errorHandler( productController.newProduct))
.get( errorHandler( productController.getLatestProducts));

router.route("/filter")
.get(productController.filterAllProduct);

router.route("/admin")
.get(auth.adminOnly, errorHandler(productController.getAdminProducts));

router.route("/categories")
.get(errorHandler(productController.getAllCategory));

router.route("/:id")
.get( errorHandler( productController.getSingleProduct))
.patch(auth.adminOnly, singleUpload, errorHandler( productController.updateProduct))
.delete(auth.adminOnly, errorHandler( productController.deleteProduct));




export default router