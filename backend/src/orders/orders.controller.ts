import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { GetOrderUseCase } from './use-cases/get-order.usecase';
import { DeleteOrderUseCase } from './use-cases/delete-order.usecase';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateOrderDto } from './Dtos/Create-Order.Dto';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly getOrderUseCase: GetOrderUseCase,
        private readonly deleteOrderUseCase: DeleteOrderUseCase,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() dto: CreateOrderDto) {
        const order = await this.createOrderUseCase.execute(req.user.sub, dto.items);
        return order;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return await this.getOrderUseCase.execute(id, req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        return await this.deleteOrderUseCase.execute(id, req.user.sub);
    }
}
