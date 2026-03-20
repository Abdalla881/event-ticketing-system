import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  readonly user_name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsOptional()
  readonly status?: string;

  @IsOptional()
  readonly phone?: string;
}