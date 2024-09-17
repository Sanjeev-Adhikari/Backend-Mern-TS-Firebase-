import * as dotenv from 'dotenv';
dotenv.config();
import { dbConnection } from './database/connection.js';
import express, {Application, Request, Response} from 'express';
import NodeCache from 'node-cache';
//allroutes
import userRoute from './routes/userRoutes.js';
import productRoute from './routes/productRoute.js';
import orderRoute from './routes/orderRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';

const app:Application = express();

const PORT:number = parseInt(process.env.PORT as string);

dbConnection(process.env.MONGO_URI);

export const nodeCache = new NodeCache();

app.use(express.json());

//all routes
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/admin/", dashboardRoute);
//routes end
app.use("/uploads", express.static("uploads"));

app.get("/", (req:Request, res:Response)=>{
    res.send("Our express is ready");
});

app.listen(PORT, ()=>{
    console.log(`Express is up and unning at PORT:${PORT} `);
});