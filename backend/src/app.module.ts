import { Module } from '@nestjs/common';
import { DataBaseModule } from './data-base/data-base.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DataBaseModule, UsersModule],
})
export class AppModule {}
