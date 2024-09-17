import { Product } from "../models/product.js";

export const getCategories = async ({categories, productCount} : {categories: string[], productCount: number})=>{
    const categoriesCountPomise = categories.map((category)=> Product.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPomise);

    const categoryCount:Record<string, string |number>[] = [];

    categories.forEach((category, i)=>{
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productCount) * 100 ) + '%',
        });
    });
    return categoryCount;
}