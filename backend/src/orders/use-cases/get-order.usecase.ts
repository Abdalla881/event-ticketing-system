import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IOrderRepository } from '../repositories/order.repository';

@Injectable()
export class GetOrderUseCase {
    constructor(
        @Inject('ORDER_REPO') private readonly orderRepository: IOrderRepository,
    ) { }

    async execute(orderId: string, userId: string) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('You do not have permission to view this order');
        }

        return {
            id: order.id,
            userId: order.userId,
            status: order.status,
            totalAmount: order.totalAmount,
            currency: order.currency,
            isTicketsGenerated: order.isTicketsGenerated,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map((item) => ({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
            })),
        };
    }
}
