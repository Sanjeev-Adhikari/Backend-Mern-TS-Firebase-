import { Request, Response } from "express";
import { OrderData, OrderStatus } from "../types/orderTypes.js";
import { Order } from "../models/order.js";
import StockManager from "../services/stockManager.js";
import { invalidateCache } from "../services/InvalidateCache.js";
import { User } from "../models/user.js";
import { nodeCache } from "../app.js";


class OrderController{
    async createOrder(req:Request, res:Response):Promise<void>{
 
        const {deliveryInfo, user, subtotal, tax, deliveryCharges, discount, total, orderItems}:OrderData = req.body;

        if(!deliveryInfo || !user || !subtotal || !tax || !deliveryCharges || !discount || !total || !orderItems){
            res.status(400).json({
                message: "Please provide all the required fields"
            });
            return;
        }
 
        const order = await Order.create({
          deliveryInfo,
          user,
          subtotal,
          tax,
          deliveryCharges,
          discount,
          total,
          orderItems
        });
        
        const stockManager = new StockManager(res);
        await stockManager.manageStock(orderItems);

        invalidateCache({product: true, order: true, admin: true, userId:user, productId: order.orderItems.map((i)=>i.productId) });

        if(order){
            res.status(201).json({
                message: "Order placxed successfully",
                data: order
            });
            return;
        }
    }

    async getMyOrders(req:Request, res:Response):Promise<void>{
        const {id: user} = req.query;
        const key = `myOrders${user}`;
        let myOrders;
    
        if(nodeCache.has(key))
            myOrders = JSON.parse(nodeCache.get(key) as string);

        else{
            myOrders = await Order.find({user});

            if(!myOrders){
                res.status(400).json({
                    message: "There are no orders yet!"
                });
                return;
            }
            nodeCache.set(key, JSON.stringify(myOrders));
            }

            const userdetails = await User.findById(user);

               if (!userdetails) {
                   res.status(404).json({
                       message: "User not found",
                   });
                   return;
               }
               res.status(200).json({
                   message: `Here are your orders, ${userdetails.name}`,
                   data: myOrders,
            });
            return;
    }
    
    async getAllOrders(req:Request, res:Response):Promise<void>{
        
        const key = "allOrders";
        let allOrders;

        if(nodeCache.has(key))
            allOrders = JSON.parse(nodeCache.get(key) as string);

        else{
            allOrders = await Order.find().populate("user", "name");

            if(!allOrders){
                res.status(400).json({
                    message: "There are no orders yet!"
                });
                return;
            }
            nodeCache.set(key, JSON.stringify(allOrders));
        }
      
        res.status(200).json({
            message: "All orders fetched successfully",
            data: allOrders
        });
        return;

        
    }

    async getSingleOrder(req:Request, res:Response):Promise<void>{

        const {id} = req.params;
        const key = `singleOrder${id}`;
        let singleOrder;

        if(nodeCache.has(key))
            singleOrder = JSON.parse(nodeCache.get(key) as string);
       else{
        singleOrder = await Order.findById(id).populate("user", "name");

        if(!singleOrder){
            res.status(404).json({
                message: "Order with that id not found",
            })
            return;
        }
        nodeCache.set(key, JSON.stringify(singleOrder));
       }
        res.status(200).json({
            message: "Single order fetched successfully",
            data: singleOrder
        });
        return;
        
    }

    async updateOrderStatus(req:Request, res:Response):Promise<void>{
     const {id} = req.params;


     const order = await Order.findById(id);
     if(!order){
        res.status(404).json({
            message: "Order with that id not found",
        });
        return;
    }

    switch (order!.status) {
            case OrderStatus.Pending:
            order!.status = OrderStatus.UnderPreparation;
            break;
            case OrderStatus.UnderPreparation:
            order!.status = OrderStatus.Delivered;
            break;
        default:
            order!.status = OrderStatus.Delivered;
            break;  
        }

    await order?.save();
    invalidateCache({product: false, order: true, admin: true, userId: order.user, orderId: order.id});
    res.status(200).json({
        message: "Order status updated successfully",
        data: order
    });
    return;
}

    async deleteOrder(req:Request, res:Response):Promise<void>{

        const {id} = req.params;
        const order = await Order.findById(id);
        if(!order){
            res.status(404).json({
                message: "Order with that id not found",
            });
            return;
        }
        await Order.deleteOne()
       invalidateCache({product: false, order: true, admin: true, userId: order.user, orderId: order.id})
        res.status(200).json({
            message: "Order deleted successfully"
        });
        return;
    }
}

export default new OrderController()