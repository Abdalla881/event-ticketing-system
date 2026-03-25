import { IsEnum, IsNotEmpty } from 'class-validator';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export class UpdateEventStatusDto {
  @IsNotEmpty()
  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'], {
    message: 'Status must be one of: upcoming, ongoing, completed, cancelled',
  })
  status: EventStatus;
}
