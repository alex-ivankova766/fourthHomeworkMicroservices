import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthVk {
  @ApiProperty({ example: 'eyJhbGciO...yJV_adQssw5c', description: 'Vk-code' })
  @IsString({ message: 'Должно быть строкой' })
  code: string;
}
