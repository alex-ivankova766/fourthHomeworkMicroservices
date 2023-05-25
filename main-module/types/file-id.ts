import { ApiProperty } from '@nestjs/swagger';
export class FileId {
  @ApiProperty({ example: '1', description: 'Id файла из БД' })
  id: number;
}
