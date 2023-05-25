import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ChangePassCouple {
  @ApiProperty({ example: '******', description: 'Secret password' })
  @IsString({ message: 'Value must be a type of String' })
  @Length(4, 16, {
    message: 'Password must be more than 4 symbols and less than 16.',
  })
  readonly oldPassword: string;

  @ApiProperty({ example: '******', description: 'Secret password' })
  @IsString({ message: 'Value must be a type of String' })
  @Length(4, 16, {
    message: 'Password must be more than 4 symbols and less than 16.',
  })
  readonly newPassword: string;
}

export class ChangeEmailCouple {
  @ApiProperty({
    example: 'name@post.com',
    description: 'E-mail пользователя.',
  })
  @IsString({ message: 'Должно быть строкой.' })
  @IsEmail({}, { message: 'E-mail не прошёл валидацию.' })
  readonly email: string;

  @ApiProperty({
    example: 'name2@post.com',
    description: 'E-mail пользователя.',
  })
  @IsString({ message: 'Должно быть строкой.' })
  @IsEmail({}, { message: 'E-mail не прошёл валидацию.' })
  readonly newEmail: string;
}
