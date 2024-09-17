import {Request,  Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { UserData } from "../types/userTypes.js";

class UserController{
    async createNewUser(req:Request, res:Response):Promise<void>{
     const {name, _id, email, image, gender, dob }:UserData = req.body;

     let user = await User.findById(_id);
     if(user){
        res.status(200).json({
            message : `Welcome ${user.name} to your Profile`,
         });
         return;
     }

     if(!name || !email || !gender || !dob){
        res.status(400).json({
            message : "Please provide all the required fields"
        });
        return;
     }

    user = await User.create({
         _id,
         dob: new Date(dob).toISOString(),
         name,
         image,
         gender,
         email,
     });

     res.status(201).json({
        message : `Welcome ${user.name}`,
        data : user
     });
 }

    async fetchAllUser(req:Request, res:Response):Promise<void>{
        const users = await User.find();

        if(users.length === 0){
            res.status(404).json({
                message : "No any users"
            });
            return;
        }
        res.status(200).json({
            message : "Users fetched successfully",
            data : users
        });
        return;   
    }

    async fetchUserById(req:Request, res:Response):Promise<void>{
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user){
            res.status(400).json({
                message : "No any users with that id"
            });
            return;
        }
        res.status(200).json({
            message : "User fetched successfully",
            data : user
        });
        return;
      
    }

    async deleteUser(req:Request, res:Response):Promise<void>{
        const {id} =req.params;
        const user = await User.findByIdAndDelete(id);

        if(!user){
            res.status(400).json({
                message : "No any users with that id"
            })
            return;
        }
        res.status(200).json({
            message : "User deleted successfully"
        })
        return;

    }

}

export default new UserController()