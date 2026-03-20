import { Module } from '@nestjs/common';
import { DataBaseModule } from './data-base/data-base.module';
import { UsersModule } from './users/users.module';
import { OrganizersModule } from './organizers/organizers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DataBaseModule, UsersModule, OrganizersModule, AuthModule],
})
export class AppModule {}
