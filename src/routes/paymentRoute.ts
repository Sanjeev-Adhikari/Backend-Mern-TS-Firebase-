import express from "express";
import auth from "../middlewares/auth.js";
import errorHandler from "../services/catchAsync.js";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

//ROUTES-START
router.route("/")
.post(auth.adminOnly, errorHandler(paymentController.createCoupon))
.get(auth.adminOnly, errorHandler(paymentController.getAllCoupons));

router.route("/discount")
.post(errorHandler(paymentController.applyDiscount));

router.route("/:id")
.get(auth.adminOnly, errorHandler(paymentController.getSingleCoupon))
.patch(auth.adminOnly, errorHandler(paymentController.updateCoupon))
.delete(auth.adminOnly, errorHandler(paymentController.deleteCoupon));

//ROUTES-END

export default router;