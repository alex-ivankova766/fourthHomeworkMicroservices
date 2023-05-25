import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { IsEmail, Length } from 'class-validator';

export class RegistrationData {
  @ApiProperty({ example: 'name@post.com', description: 'Адрес e-mail' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'E-mail написан с опечаткой' })
  readonly email: string;

  @ApiProperty({ example: '******', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, {
    message: 'Пароль должен быть длиннее 4 symbols и меньше 16.',
  })
  readonly password: string;

  @ApiProperty({ example: 'Александра', description: 'Имя, не обязательно' })
  // @IsString({ message: 'Должно быть строкой' })
  name?: string;

  @ApiProperty({ example: 'Иванкова', description: 'Фамилия, не обязательно' })
  // @IsString({ message: 'Должно быть строкой' })
  surname?: string;

  @ApiProperty({ example: '2128506', description: 'Телефон' })
  // @IsString({ message: 'Должно быть строкой' })
  phone?: string;

  @ApiProperty({ example: '17', description: 'ID аватара' })
  // @IsInt({ message: 'Должно быть числом' })
  avatarId?: number;
}

export class ProfileRegistrationData extends RegistrationData {
  @IsInt({ message: 'Должно быть числом' })
  id: number;
}
