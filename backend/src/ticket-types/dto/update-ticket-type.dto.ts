import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import type { TicketName } from '../entities/ticket-type.entity';

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsEnum(['VIP', 'Regular', 'Student'], {
    message: 'name must be one of: VIP, Regular, Student',
  })
  name?: TicketName;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity_total?: number;

  @IsOptional()
  @IsDateString()
  sale_start?: string;

  @IsOptional()
  @IsDateString()
  sale_end?: string;
}
