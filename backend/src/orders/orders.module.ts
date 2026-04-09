import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { OrderRepositoryImpl } from './repositories/order.repository';
import { TicketTypeRepositoryImpl } from './repositories/ticket-type.repository';
import { TicketTypesService } from 'src/ticket-types/service/ticket-types.service';
import { Pool } from 'pg';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    OrderRepositoryImpl,
    TicketTypesService,

    {
      provide: 'ORDER_REPO',
      useFactory: (pool: Pool) => new OrderRepositoryImpl(pool),
      inject: ['DATABASE_POOL'],
    },
    {
      provide: 'TICKET_TYPE_REPO',
      useClass: TicketTypeRepositoryImpl,
    },
  ],
})
export class OrdersModule { }
