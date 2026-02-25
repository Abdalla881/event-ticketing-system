import { Module } from '@nestjs/common';
import { DataBaseModule } from './data-base/data-base.module';

@Module({
  imports: [DataBaseModule],
})
export class AppModule {}
