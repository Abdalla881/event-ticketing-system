import { Module } from '@nestjs/common';

import { OrganizersController } from './Controllers/organizers.controller';
import { OrganizersService } from './service/organizers.service';

@Module({
  controllers: [OrganizersController],
  providers: [OrganizersService],
})
export class OrganizersModule {}
