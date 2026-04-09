
export enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    PARTIAL = "partial"
}

export type OrderItem = {
    ticketTypeId: string;
    quantity: number;
    price: number;
    totalPrice: number;
};

export type Ticket = {
    ticketTypeId: string;
    userId: string;
};

export class Order {
    id?: string;
    userId: string;
    items: OrderItem[] = [];
    totalAmount: number = 0;
    status: OrderStatus = OrderStatus.PENDING;
    isTicketsGenerated: boolean = false;
    createdAt: Date;
    updatedAt: Date;
    currency: string;

    constructor(userId: string) {
        this.userId = userId;
        this.currency = "EGP";
        this.status = OrderStatus.PENDING;
        this.isTicketsGenerated = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    withId(id: string) {
        this.id = id;
        return this;
    }


    addItem(ticketTypeId: string, quantity: number, price: number) {
        if (this.status !== OrderStatus.PENDING) {
            throw new Error("Order is not pending");
        }

        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        const existingItem = this.items.find((item) => item.ticketTypeId === ticketTypeId);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice += quantity * price;
        }
        else {
            const item: OrderItem = {
                ticketTypeId,
                quantity,
                price,
                totalPrice: quantity * price,
            };

            this.items.push(item);
            this.totalAmount += item.totalPrice;
        }
    }



}