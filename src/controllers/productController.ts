import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Product } from "../models/product.js";
import { BaseQuery, ProductData, SearchQuery } from "../types/productTypes.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../services/InvalidateCache.js";

class ProductController{

    async newProduct(req:AuthRequest, res:Response):Promise<void>{

        const {name, category, price, stock, description,}:ProductData = req.body
        const image = req.file

        if(!image){
            res.status(400).json({
                message: "Please provide image"
            });
            return;
        }

        if(!name || !description|| !price || !stock || !category){

            rm(image.path, ()=>{
                console.log("Image is not updated")
            });
            res.status(400).json({
                message: "Please provide all the required fields"
            });
            return;
        }


       const product =  await Product.create({
            name,
            price,
            description,
            stock,
            category: category.toLowerCase(),
            image: image?.path,

        });

        invalidateCache({product: true, admin: true});

        res.status(201).json({
            message: "Product created successfully",
            data: product
        });
        return;
     
    }

    async getLatestProducts(req:Request, res:Response):Promise<void>{

        let latestProducts;

        if(nodeCache.has("latestProducts"))
            latestProducts = JSON.parse(nodeCache.get("latestProducts") as string);         
        else{
            latestProducts = await Product.find().sort({"createdAt": -1}).limit(5);
            if(latestProducts.length === 0){
                res.status(400).json({
                    message: "You don't have any products yet!"
                });
                return;
            }
            nodeCache.set("latestProducts", JSON.stringify(latestProducts));
        }
        res.status(200).json({
            message: "Latest products fetched successfully",
            data: latestProducts
        });
        return;
      
    }

    async getSingleProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params;

        let singleProduct;

        if(nodeCache.has(`singleproduct${id}`))
            singleProduct = JSON.parse(nodeCache.get(`singleproduct${id}`) as string);
        else{
            
            singleProduct = await Product.findById(id);
            if(!singleProduct){
                res.status(404).json({
                    message: "No product found with that id"
                });
                return;
            }
            nodeCache.set(`singleproduct${id}`, JSON.stringify(singleProduct));
        }
        res.status(200).json({
            message: "Single product fetched successfully",
            data: singleProduct
        });
        return;
      
    }

    async getAllCategory(req:Request, res:Response):Promise<void>{

        let categories;

        if(nodeCache.has("categories"))
            categories = JSON.parse(nodeCache.get("categories") as string);

        else{
            categories = await Product.distinct("category")
            if(!categories){
                res.status(400).json({
                    message: "No category found"
                });
                return;
            }
            nodeCache.set("categories", JSON.stringify(categories));
        }
        res.status(200).json({
            message: "categories fetched successfully",
            data: categories
        });
        return;
        
    }

    async getAdminProducts(req:Request, res:Response):Promise<void>{

        let adminProducts;

        if(nodeCache.has("adminProducts"))
            adminProducts = JSON.parse(nodeCache.get("adminProducts") as string);
        else{
            adminProducts = await Product.find()
            nodeCache.set("adminProducts", JSON.stringify(adminProducts));
        }
        if(adminProducts.length === 0){
            res.status(404).json({
                message: "Admin, you haven't created any products yet!"
            });
            return;
        }
        res.status(200).json({
            message: "Admin Products fetched successfully",
            data: adminProducts
        });    
        return;
    }

    async updateProduct(req:AuthRequest, res:Response):Promise<void>{
        const {id} = req.params;
        const image = req.file;
        const {name, category, price, stock, description}:ProductData = req.body;

        const product = await Product.findById(id);

        if(!product){
            res.status(404).json({
                message: "No product found with that id"
            });
            return;
        }

        if(image){
            rm( product.image, ()=>{
                console.log("old image deleted");
            });
            product.image = image.path;
        }
        if(name) product.name = name;
        if(description) product.description = description;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;

        await product.save();
        invalidateCache({product: true, admin: true, productId: String(product._id)});

        res.status(200).json({
            message: "Product updated successfully",
            data: product
        });
        return;
    }

    async deleteProduct(req:AuthRequest, res:Response):Promise<void>{
        const {id} = req.params;
        const image = req.file;

        const product = await Product.findById(id);

        if(!product)
        {
            res.status(404).json({
                message: "No product with that id"
            });
        return;
        }
        rm( product.image, ()=>{
            console.log("old image deleted")
        });
        await Product.findByIdAndDelete(id);
        invalidateCache({product: true, admin: true, productId: String(product._id)});
        res.status(200).json({
            message: "Product deleted successfully"
        });
        return;
    }

    async filterAllProduct(req:Request<{},{},{},SearchQuery>, res:Response):Promise<void>{
        
        const {category, price, search, sort} = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page-1)*limit;
        const baseQuery: BaseQuery = {};
       
        if(search)
         baseQuery.name = {
            $regex: search,
            $options: "i",
        };
        if(price)
            baseQuery.price = {
                $lte: Number(price),
            }; 
        if(category) baseQuery.category = category;

        const [products, filteredProductsOnly] = await Promise.all([
            Product.find(baseQuery)
            .sort(sort && {price: sort === "asc" ? 1 : -1})
            .limit(limit)
            .skip(skip),
            Product.find(baseQuery)
    
        ]);
        const totalPages = Math.ceil(filteredProductsOnly.length/limit);

        res.status(200).json({
            products,
            totalPages      
        });
        return;
    }
}

export default new ProductController()