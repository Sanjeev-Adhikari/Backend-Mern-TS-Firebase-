import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";

export interface AuthRequest extends Request{
    user?:{
        username : string,
        email : string,
        role : string,
        password : string,
        id : string
    };    
}

export enum Role{
    Admin = 'admin',
    User = 'user'
}

class AuthMiddleware{
    async adminOnly(req:Request, res:Response, next:NextFunction):Promise<void>{
        const {id} = req.query;
        if(!id){
            res.status(401).json({
                message : "Log in first"
            });
            return;
        }

        const user = await User.findById(id);
        if(!user){
            res.status(401).json({
                message : "No user with that id"
            });
            return;
        }

        if(user.role !== Role.Admin){  res.status(403).json({
            message : "You don't have permission"
        });
        return;
        }

        next();
    }
}
export default new AuthMiddleware();