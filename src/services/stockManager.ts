import { Response } from "express";
import { Product } from "../models/product.js";
import { OrderItems } from "../types/orderTypes.js";

class StockManager {
    res: Response;

    constructor(res: Response) {
        this.res = res;
    }

    async manageStock(orderItems: OrderItems[]) {
        for (let i = 0; i < orderItems.length; i++) {
            const order = orderItems[i];
            const product = await Product.findById(order.productId);
            if (!product) {
                this.res.status(404).json({
                    message: "Product with that id not available",
                });
                return;
            }
            product.stock -= order.quantity;
            await product.save();
        }
    }
}

export default StockManager;