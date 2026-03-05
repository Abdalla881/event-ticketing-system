import { Module } from '@nestjs/common';

import { OrganizersController } from './Controllers/organizers.controller';

@Module({
  controllers: [OrganizersController],
})
export class OrganizersModule {}
