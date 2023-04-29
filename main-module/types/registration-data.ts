import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsEmail, Length } from "class-validator"

export class RegistrationData { 
    @ApiProperty({example: 'name@post.com', description: 'Адрес e-mail'})
    @IsString({message: 'Value must be a type of String'})
    @IsEmail({}, {message: 'E-mail is incorrect'})
    readonly email: string;

    @ApiProperty({example: '******', description: 'Пароль'})
    @IsString({message: 'Value must be a type of String'})
    @Length(4, 16, {message: 'Password must be more than 4 symbols and less than 16.'})
    readonly password: string;

    @ApiProperty({example: 'Александра', description: 'Имя, не обязательно'}) 
    @IsString({message: 'Value must be a type of String'})
    name?:string;

    @ApiProperty({example: 'Иванкова', description: 'Фамилия, не обязательно'}) 
    @IsString({message: 'Value must be a type of String'})
    surname?: string;

}