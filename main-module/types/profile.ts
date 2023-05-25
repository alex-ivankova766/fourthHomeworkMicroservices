import { ApiProperty } from '@nestjs/swagger';
export class Profile {
  @ApiProperty({ example: '1', description: 'Id профиля' })
  id: number;

  @ApiProperty({ example: 'Александра', description: 'Имя' })
  name: string;

  @ApiProperty({ example: 'Иванкова', description: 'Фамилия' })
  surname: string;

  @ApiProperty({ example: '2128506', description: 'Телефон' })
  phone: string;
}
