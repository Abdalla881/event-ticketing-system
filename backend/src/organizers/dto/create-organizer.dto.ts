import { IsNotEmpty, IsUUID } from 'class-validator';
export class CreateOrganizerDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
}
