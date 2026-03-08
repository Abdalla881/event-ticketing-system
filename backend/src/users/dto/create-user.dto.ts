import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
} from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  user_name: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
  @IsNotEmpty()
  @IsEnum(['active', 'inactive'])
  status: string;
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
