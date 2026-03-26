import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import type { TicketName } from '../entities/ticket-type.entity';

export class CreateTicketTypeDto {
  @IsNotEmpty()
  @IsUUID()
  event_id: string;

  @IsNotEmpty()
  @IsEnum(['VIP', 'Regular', 'Student'], {
    message: 'name must be one of: VIP, Regular, Student',
  })
  name: TicketName;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity_total: number;

  @IsOptional()
  @IsDateString()
  sale_start?: string;

  @IsOptional()
  @IsDateString()
  sale_end?: string;
}
