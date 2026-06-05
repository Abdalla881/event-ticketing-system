import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IOrderRepository } from '../repositories/order.repository';

@Injectable()
export class DeleteOrderUseCase {
    constructor(
        @Inject('ORDER_REPO') private readonly orderRepository: IOrderRepository,
    ) { }

    async execute(orderId: string, userId: string): Promise<{ message: string }> {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this order');
        }

        await this.orderRepository.delete(orderId);

        return { message: `Order "${orderId}" has been successfully deleted` };
    }
}
