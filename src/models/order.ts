import mongoose, { mongo } from "mongoose";
import { OrderData } from "../types/orderTypes.js";

const Schema = new mongoose.Schema({
    deliveryInfo: {
        address: {
            type: String,
            required:[ true, "Please provide delivery address"],
        },
        city: {
            type: String,
            required:[ true, "Please provide your city name"],
        },
        street: {
            type: String,
            required:[ true, "Please provide your city name"],
        },
        houseNo: {
            type: Number,
            required:[ true, "Please provide your city name"],
        },
    },

    user: {
        type: String,
        ref: "User",
        required: true,

    },
    subtotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true, 
    },
    deliveryCharges: {
        type: Number,
        required: true, 
        default: 0
    },
    discount: {
        type: Number,
        required: true, 
        default: 0
    },
    total: {
        type: Number,
        required: true, 
    },
    status: {
        type: String,
        enum: ['Pending', 'Delivered', 'Cancelled', 'UnderPreparation'],
        default: 'Pending',
    },
    orderItems: [
        {
            name: String,
            image: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product"
            }
        }
    ]
},{
    timestamps: true,
});

export const Order = mongoose.model<OrderData>("Order", Schema);