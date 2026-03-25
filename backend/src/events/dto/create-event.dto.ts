import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
  ValidateIf,
  IsEnum
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import * as eventEntity from '../entities/event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  @IsUUID()
  organizer_id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsDateString()
  start_datetime: string;

  @IsNotEmpty()
  @IsDateString()
  end_datetime: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsEnum(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: eventEntity.EventStatus;

}
