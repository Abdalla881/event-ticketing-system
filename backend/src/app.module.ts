import { Module } from '@nestjs/common';
import { DataBaseModule } from './data-base/data-base.module';
import { UsersModule } from './users/users.module';
import { OrganizersModule } from './organizers/organizers.module';

@Module({
  imports: [DataBaseModule, UsersModule, OrganizersModule],
})
export class AppModule {}
