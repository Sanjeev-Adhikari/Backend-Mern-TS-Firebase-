import express  from "express";
import errorHandler from "../services/catchAsync.js";
import orderController from "../controllers/orderController.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

router.route("/")
.post(errorHandler(orderController.createOrder))
.get(auth.adminOnly, errorHandler(orderController.getAllOrders));

router.route("/my")
.get(errorHandler(orderController.getMyOrders));

router.route("/:id")
.get(errorHandler(orderController.getSingleOrder))
.patch(auth.adminOnly, errorHandler(orderController.updateOrderStatus))
.delete(auth.adminOnly, errorHandler(orderController.deleteOrder));


export default router