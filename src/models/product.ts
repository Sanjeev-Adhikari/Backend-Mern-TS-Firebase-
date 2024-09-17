import mongoose from "mongoose";
import { ProductData } from "../types/productTypes.js";

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
    },
    description: {
        type: String,
       
    },
    stock: {
        type: Number,
        required: [true, "Please provide product stocks available"],
    },
    price: {
        type: Number,
        required: [true, "Please provide product price"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    reveiws: { 
        type: Number,
        default: 0,
    },
    Productstatus: {
        type: String,
        required: [true, "Please provide product status" ],
        enum: ['Available', 'Unavailable'],
        default: 'Available'

    },
    category: {
        type: String,
        required: [true, "Please specify product category"],
        trim: true
       
    },
    image: {
        type: String,
        
    }
    // image: [
    //     {
    //         public_id: {
    //             type: String,
    //             required: [true, "please provide public id"],
    //         },
    //         url: {
    //             type: String,
    //             required: [true, "Please enter image url"]
    //         }
    //     }
    // ]

},{
    timestamps: true
});

export const Product = mongoose.model<ProductData>("Product", Schema);