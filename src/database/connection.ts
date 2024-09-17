import mongoose from "mongoose";

export const dbConnection = async (URI:any)=>{
    await mongoose.connect(URI);
    console.log("MongoDb connected successfully");
}