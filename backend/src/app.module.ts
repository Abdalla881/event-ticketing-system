import { Module } from '@nestjs/common';
import { DataBaseModule } from './data-base/data-base.module';
import { UsersModule } from './users/users.module';
import { OrganizersModule } from './organizers/organizers.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DataBaseModule, UsersModule, OrganizersModule, AuthModule, EventsModule],
})
export class AppModule {}
