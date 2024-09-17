import { Request, Response } from "express";
import { PaymentData } from "../types/paymentTypes.js";
import { Coupon } from "../models/coupon.js";

class PaymentController{
    async createCoupon(req:Request, res:Response):Promise<void>{
        const {couponCode, discountAmount}:PaymentData = req.body;

        if(!couponCode || !discountAmount){
            res.status(400).json({
                message: "Please provide the required fields"
            });
            return;
        }

        const coupon = await Coupon.create({
            couponCode,
            discountAmount
        });
        res.status(201).json({
            message: `Coupon ${couponCode} created successfully`,
            data: coupon
        });
        return;
    }

    async getAllCoupons(req:Request, res:Response):Promise<void>{
        const allCoupons = await Coupon.find();

        if(allCoupons.length === 0){
            res.status(400).json({
                message: "No coupons yet!"
            });
            return;
        }
        res.status(200).json({
            message: "Coupons fetched successfully",
            date: allCoupons
        });
        return;

    }

    async applyDiscount(req:Request, res:Response):Promise<void>{
        const {couponCode} = req.query;

        const discount = await Coupon.findOne({couponCode})

        if(!discount){
            res.status(404).json({
                message: "Invalid coupon code"
            });
            return;
        }
        res.status(200).json({
            message: "Discount fetched successfully",
            data: discount.discountAmount
        });
        return
    }

    async getSingleCoupon(req:Request, res:Response):Promise<void>{
        const {id} = req.params;

        const singleCoupon = await Coupon.findById(id);
        if(!singleCoupon){
            res.status(404).json({
                message: "Coupon with that id not avaibale"
            });
            return;
        }

        res.status(200).json({
            message: "single coupon fetched successfully",
            data: singleCoupon
        });
        return;
    }

    async updateCoupon(req:Request, res:Response):Promise<void>{
        const {id} = req.params;
        const {couponCode, discountAmount}:PaymentData = req.body;
        const coupon = await Coupon.findById(id);

        if(!coupon){
            res.status(404).json({
                message: "Coupon with that id not avaibale"
            });
            return;
        }
        if(couponCode)
            coupon.couponCode = couponCode;
        if(discountAmount)
            coupon.discountAmount = discountAmount;
        await coupon.save();

        res.status(200).json({
            message: "Coupon updated succesfully",
            data: coupon
        });
        return;
}

async deleteCoupon(req:Request, res:Response):Promise<void>{
    const {id} = req.params;
    const coupon = await Coupon.findById(id);
    
    if(!coupon){
        res.status(404).json({
            message: "Coupon with that id not avaibale"
        });
        return;
    }

    const deletdCoupon = await Coupon.findByIdAndDelete(id);

    res.status(200).json({
        message: `Coupon ${deletdCoupon?.couponCode} deleted successfully`,
    });
    return;



}
}
export default new PaymentController();