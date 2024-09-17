export interface OrderData{
deliveryInfo: DeliveryInfo
user: string,
subtotal: number,
tax: number,
deliveryCharges: number,
discount: number,
total: number,
status: OrderStatus,
orderItems: OrderItems[],
createdAt: Date,

}

export interface OrderItems{
    name: string,
    image: string,
    price: number,
    quantity: number,
    productId: string,
}

export interface DeliveryInfo{
    address: string,
    city: string,
    street: string,
    houseNo: number,
}

export enum OrderStatus{
    Pending = "Pending",
    UnderPreparation ="UnderPreparation",
    Delivered = "Delivered"
}