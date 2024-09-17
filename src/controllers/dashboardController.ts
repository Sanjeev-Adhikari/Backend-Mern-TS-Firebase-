import { Request, Response } from "express";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../services/calculatePercentage.js";
import { nodeCache } from "../app.js";
import { OrderStatus } from "../types/orderTypes.js";
import { getCategories } from "../services/getCategories.js";
import {Role} from '../types/userTypes.js'
import { chartData } from "../services/calculatechartData.js";

 class DashboardController{
    

    async getDashboardStats(req:Request, res:Response):Promise<void>{

    let stats;
    const key = "stats";
       if(nodeCache.has(key))
        stats = JSON.parse(nodeCache.get(key) as string);

       else{
       
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth()- 6);
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };
        const thisMonthProductsPromise =  Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthProductsPromise =  Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const thisMonthUsersPromise =  User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthUsersPromise =  User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const thisMonthOrdersPromise =  Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthOrdersPromise =  Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const lastSixMonthOrdersPromise =  Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
           
        });

        const latestTransactionsPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);

        
        const [ thisMonthProduct,
            thisMonthOrders,
            thisMonthUsers,
            lastMonthProducts,
            lastMonthOrders,
            lastMonthUsers,
            productCount,
            userCount,
            orderCount,
            lastSixMonthOrders,
            categories,
            femaleCount,
            latestTransactions
        ]   
             = await Promise.all([
            thisMonthProductsPromise,
            thisMonthOrdersPromise,
            thisMonthUsersPromise,
            lastMonthProductsPromise,
            lastMonthOrdersPromise,
            lastMonthUsersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find().select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "female" }),
            latestTransactionsPromise
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) =>total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) =>total + (order.total || 0), 0);
 

        const changeInPercentage = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(
                thisMonthProduct.length,
                lastMonthProducts.length
            ),
            user: calculatePercentage(
                thisMonthUsers.length,
                lastMonthUsers.length
            ),
            order: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            ),
        };
      
        const revenue = orderCount.reduce(
            (total, order) => total + (order.total || 0), 0
        );

        const counts = {
            revenue,
            user: userCount,
            product: productCount,
            order: orderCount.length,
        }

        const orderMonthCounts = chartData({
            length: 6,
            today,
            documentArr: lastSixMonthOrders
        });
        const orderMonthlyRevenue = chartData({
            length: 6,
            today,
            documentArr: lastSixMonthOrders,
            property: "total",
        });

    //when the amount is gonna be big, commented code must be best option as it works in a single loop for both but negligible effect on performance
        // lastSixMonthOrders.forEach((order)=>{
        //     const creationDate = order.createdAt;
        //     const monthDifference = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        //     if(monthDifference < 6){
        //         orderMonthCounts[5 - monthDifference] += 1;
        //         orderMonthlyRevenue[5 - monthDifference] += order.total;
        //     }
        // });

        const categoryCount = await getCategories({categories, productCount});

        const userRatio = {
            male: userCount - femaleCount,
            female: femaleCount
        }

        const modifiedLatestTransaction = latestTransactions.map((i)=>({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }))

        stats = {
            categoryCount,
            changeInPercentage, 
            counts, 
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            userRatio,
            latestTransactions: modifiedLatestTransaction
        };

        nodeCache.set(key, JSON.stringify(stats));
       }

        
      if(!stats){
        res.status(400).json({
            message: "You don't have anything"
        });
        return;
      }
      res.status(200).json({
        message: "Here are yourdashboard stats",
        data: stats,
    });
    return;
    }

    async getPieCharts(req:Request, res:Response):Promise<void>{
        let charts;
        const key = "charts";

        if(nodeCache.has(key))
            charts = JSON.parse(nodeCache.get(key) as string);

        else{

            const allOrderPromise = ["total", "discount", "subtotal", "tax", "deliveryCharges"];

            const [pendingOrder, underPreparationOrder, deliveredOrder, categories, productCount, productOutOfStock, allOrders, allusers, adminUsers, customerUsers]   = await Promise.all([
                Order.countDocuments({status: OrderStatus.Pending}),
                Order.countDocuments({status: OrderStatus.UnderPreparation}),
                Order.countDocuments({status: OrderStatus.Delivered}),
                Product.distinct("category"),
                Product.countDocuments(),
                Product.countDocuments({stock: 0}),
                Order.find().select(allOrderPromise),
                User.find().select(["dob"]),
                User.countDocuments({role: Role.Admin}),
                User.countDocuments({role: Role.User})

            ]);

            const orderFullfillmentRatio = {
                pending: pendingOrder,
                underPreparation: underPreparationOrder,
                delivered: deliveredOrder
            };

            const productCategories = await getCategories({categories, productCount});

            const stockAvailability = {
                inStock:productCount - productOutOfStock,
                outOfStock: productOutOfStock
            };

            const grossIncome = allOrders.reduce((prev, order)=>prev + (order.total || 0), 0);
            const discount = allOrders.reduce((prev, order)=>prev + (order.discount || 0), 0);
            const productionCost = allOrders.reduce((prev, order)=>prev + (order.deliveryCharges || 0), 0);
            const burnt = allOrders.reduce((prev, order)=>prev + (order.tax || 0), 0);
            
            const marketingCost =  Math.round(grossIncome * (20 / 100));

            const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

            const revenueDistribution = {
                netMargin,
                discount,
                productionCost,
                burnt,
                marketingCost,
            };

            const userAgeGroup = {
                teen: allusers.filter((i) => i.age < 20).length,
                adult: allusers.filter((i) => i.age >= 20 && i.age < 40).length,
                old: allusers.filter((i) => i.age >= 40).length,
            }

            const totalUserRatio = {
                admin: adminUsers,
                customer: customerUsers
            }
            charts = {
                orderFullfillmentRatio,
                productCategories,
                stockAvailability,
                revenueDistribution,
                userAgeGroup,
                totalUserRatio
            }
            nodeCache.set(key, JSON.stringify(charts));
        }
        res.status(200).json({
            message: "Here are yourdashboard stats",
            data: charts,
        });
        return;
    }

    async getBarGraphs(req:Request, res:Response):Promise<void>{
        let graphs;

        const key = "adminBarChart";

        if(nodeCache.has(key))
            graphs = JSON.parse(nodeCache.get(key) as string);

        else{

            const today = new Date();

            const sixMonthAgo = new Date();
            sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

            const oneYearAgo = new Date();
            oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

            const lastSixMonthProductPromise =  Product.find({
                createdAt: {
                    $gte: sixMonthAgo,
                    $lte: today
                }
               
            });
            const lastSixMonthUserPromise =  User.find({
                createdAt: {
                    $gte: sixMonthAgo,
                    $lte: today
                }
               
            });
            const lastSixMonthOrderPromise =  Order.find({
                createdAt: {
                    $gte: oneYearAgo,
                    $lte: today
                }
               
            });

            const [products, users, orders] = await Promise.all([
               lastSixMonthProductPromise,
               lastSixMonthUserPromise,
               lastSixMonthOrderPromise
            ]);

            const productCounts = chartData({length : 6, today, documentArr: products});
            const userCounts = chartData({length : 6, today, documentArr: users});
            const orderCounts = chartData({length : 12, today, documentArr: orders});

            graphs = {
                users: userCounts,
                product: productCounts,
                order: orderCounts

            }

            nodeCache.set(key, JSON.stringify(graphs));
        }

        res.status(200).json({
            message: "Here are your bar graphs",
            data: graphs
        });
        return;
    }

    async getLineCharts(req:Request, res:Response):Promise<void>{

        let charts;
        const key = "adminLineCharts";

        if(nodeCache.has(key))
            charts = JSON.parse(nodeCache.get(key) as string);

        else{
            const today = new Date();

            const oneYearAgo = new Date();
            oneYearAgo.setMonth(oneYearAgo.getMonth() -12);

            const baseQuery = {
                createdAt: {
                    $gte: oneYearAgo,
                    $lte: today,
                },
            };
            const [products, users, orders] = await Promise.all([
                Product.find(baseQuery).select("createdAt"),
                User.find(baseQuery).select("createdAt"),
                Order.find(baseQuery).select(["createdAt", "discount", "total"]),
            ]);

            const productCounts = chartData({length: 12, today, documentArr: products});
            const userCounts = chartData({length: 12, today, documentArr: users});
            const discount = chartData({length: 12, today, documentArr: orders, property: "discount"});
            const revenue = chartData({length: 12, today, documentArr: orders, property: "total"});

            charts = {
                product: productCounts,
                userCounts: userCounts,
                discount,
                revenue

            }

            nodeCache.set(key, JSON.stringify(charts));
        }

        res.status(200).json({
            message: "Here are your line charts",
            data: charts
        })
    }
 }

 export default new DashboardController();