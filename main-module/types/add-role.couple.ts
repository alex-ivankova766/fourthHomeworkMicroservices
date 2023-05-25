import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class AddRoleCouple {
  @IsString({ message: 'Must be a type of String' })
  @ApiProperty({ example: 'admin', description: 'User role' })
  readonly roleName: string;

  @IsNumber({}, { message: 'Must be a type of number' })
  @ApiProperty({ example: '1', description: 'User ID' })
  readonly id?: number;

  @ApiProperty({ example: 'name@post.com', description: 'e-mail address' })
  @IsString({ message: 'Value must be a type of String' })
  @IsEmail({}, { message: 'E-mail is incorrect' })
  readonly email?: string;
}
