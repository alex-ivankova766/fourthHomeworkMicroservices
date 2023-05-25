import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsEmail, Length } from 'class-validator';

export class LoginCouple {
  @ApiProperty({
    example: 'name@post.com',
    description: 'E-mail пользователя.',
  })
  @IsString({ message: 'Должно быть строкой.' })
  @IsEmail({}, { message: 'E-mail не прошёл валидацию.' })
  readonly email: string;

  @ApiProperty({ example: '******', description: 'Пароль.' })
  @IsString({ message: 'Должно быть строкой.' })
  @Length(4, 16, { message: 'Пароль должен быть более 4 и менее 16 символов.' })
  readonly password: string;
}
