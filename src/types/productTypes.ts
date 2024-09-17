import { FilterQuery } from "mongoose"

export interface ProductData{
    name: string,
    description: string,
    stock: number,
    price: number,
    ratings: number,
    reviews: number,
    productStatus: ProductStatus,
    category: string,
    image: string
    createdAt: Date,
    updatedAt: Date,
   
}
export enum ProductStatus{
    Available = 'Available',
    Unavailable =  'Unavailable',
 };

export interface AuthRequest extends Request{

    user?:{
        username : string, 
        email : string, 
        role : Role, 
        password : string, 
        id : string
    }
}

export enum Role{
    Admin = 'admin',
    Customer = 'customer'
}

export interface SearchQuery{
    search?: string,
    price?:number,
    category?: string,
    sort?:string,
    page?:string,
}

export interface BaseQuery extends FilterQuery<ProductData>{
    name?: {
        $regex: string,
        $options: string,
    },
    price?: {
        $lte: number,
    },
    category?: string,
}

export interface InvalidateCache{
    product?: boolean,
    order?: boolean,
    admin?: boolean,
    userId?: string,
    orderId?: string,
    productId?: string | string[],
}