import { Module } from '@nestjs/common';
import { EventsController } from './Controllers/events.controller';
import { EventsService } from './service/events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
