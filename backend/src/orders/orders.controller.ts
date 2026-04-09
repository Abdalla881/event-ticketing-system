import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateOrderDto } from './Dtos/Create-Order.Dto';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() dto: CreateOrderDto) {

        const order = await this.createOrderUseCase.execute(req.user.sub, dto.items);
        return order;
    }
}
