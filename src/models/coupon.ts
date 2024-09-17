import mongoose from 'mongoose';
import { PaymentData } from '../types/paymentTypes.js';


const Schema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: [true, 'Please eneter the coupon code'],
        unique: true,
    },
    discountAmount: {
        type: Number,
        required: [true, 'Please provide the discount amount']
    },

});

export const Coupon = mongoose.model<PaymentData>("Coupon", Schema);
