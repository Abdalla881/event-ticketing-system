import { Module } from '@nestjs/common';
import { UsersController } from './Controllers/users.controller';
import { UsersService } from './service/user.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
