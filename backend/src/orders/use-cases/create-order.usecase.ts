import { Order } from "../order.entity";
import { Inject, Injectable } from "@nestjs/common";
import type { ITicketTypeRepository } from "../repositories/ticket-type.repository";
import type { IOrderRepository } from "../repositories/order.repository";

type CreateOrderItem = {
    ticketTypeId: string;
    quantity: number;
};
@Injectable()
export class CreateOrderUseCase {
    constructor(
        @Inject('ORDER_REPO') private orderRepository: IOrderRepository,
        @Inject('TICKET_TYPE_REPO') private ticketTypeRepository: ITicketTypeRepository) { }

    async execute(userId: string, items: CreateOrderItem[]): Promise<any> {
        if (!userId) {
            throw new Error("User ID is required");
        }
        if (!items.length) {
            throw new Error("Order must have at least one item");
        }
        const order = new Order(userId);
        for (const item of items) {
            const ticketType = await this.ticketTypeRepository.findOne(item.ticketTypeId);
            if (!ticketType) {
                throw new Error("Ticket type not found");
            }
            order.addItem(
                ticketType.id,
                item.quantity,
                ticketType.price
            );
        }
        await this.orderRepository.save(order);
        return { message: "Order created successfully", order: { id: order.id, userId: order.userId, totalAmount: order.totalAmount, status: order.status, isTicketsGenerated: order.isTicketsGenerated, createdAt: order.createdAt, updatedAt: order.updatedAt, currency: order.currency } };
    }
}