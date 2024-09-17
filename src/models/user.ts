import mongoose from 'mongoose'
import validator from 'validator'
import { UserData } from '../types/userTypes.js';



const Schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please enter Id"],
        },
        name: {
            type: String,
            required: [true, "Please provide name"],
        },
        email: {
            type: String,
            required: [true, "Please enter email"],
            unique: [true, "Email already exists"],
            validate: validator.default.isEmail,
        },
        image: {
            type: String,
            required: [true, "Please add image"],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: "user",
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: [true, "Please provide gender"],

        },
        dob: {
            type: Date,
            required: [true, "Please enter dob"],
           
        },
    },{
        timestamps: true,
    }
);
Schema.virtual("age").get(function(){
 const today = new Date();
 const dob = this.dob;
 let age = today.getFullYear() - dob.getFullYear();
 if(
    today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
) {
    age--;
}
return age;
});

export const User = mongoose.model<UserData>("User", Schema);

    