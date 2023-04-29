import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsEmail, Length } from "class-validator"

export class InitCouple { 
    @ApiProperty({example: 'admin@post.com', description: 'E-mail администратора.'})
    @IsString({message: 'Должно быть строкой.'})
    @IsEmail({}, {message: 'E-mail не прошёл валидацию.'})
    readonly email: string;

    @ApiProperty({example: 'йцукен', description: 'Пароль.'})
    @IsString({message: 'Должно быть строкой.'}) 
    @Length(4, 16, {message: 'Пароль должен быть более 4 и менее 16 символов.'})
    readonly password: string;
}