import { nodeCache } from "../app.js";
import { InvalidateCache } from "../types/productTypes.js";

export const invalidateCache = ({product,admin, order, userId, orderId, productId }: InvalidateCache)=> {

    if(product){
        const productkeys: string[] = ["latestProducts", "categories", "adminProducts"];

        if(typeof productId === "string")
          productkeys.push(`singleproduct${productId}`);

        if(typeof productId === "object")
          productId.forEach((i)=> productkeys.push(`singleproduct${i}`));

        nodeCache.del(productkeys);
    }
    if(order){
      const orderKeys:string[] = ['allOrders', `myOrders${userId}`, `singleOrder${orderId}`];
      nodeCache.del(orderKeys);
    }
    if(admin){
      const adminKeys: string[] = ['stats', 'charts', 'adminBarChart', 'adminLineCharts'];
      nodeCache.del(adminKeys);    
    }
}