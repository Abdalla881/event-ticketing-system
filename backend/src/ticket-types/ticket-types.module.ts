import { Module } from '@nestjs/common';
import { TicketTypesController } from './Controllers/ticket-types.controller';
import { TicketTypesService } from './service/ticket-types.service';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
