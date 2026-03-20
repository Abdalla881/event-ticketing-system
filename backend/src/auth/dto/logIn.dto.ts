
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LogInDto {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
    @IsNotEmpty()
    readonly password: string;
}
