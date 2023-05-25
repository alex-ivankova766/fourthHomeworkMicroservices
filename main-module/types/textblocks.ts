import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsInt, IsString } from 'class-validator';

export class CreateBlockData {
  @ApiProperty({ example: 'title-block', description: 'Системное название' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly systemName: string;
  @ApiProperty({ example: 'main', description: 'Где расположено' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly group: string;
  @ApiProperty({ example: 'Наши приемущества', description: 'Заглавие' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly title: string;
  @ApiProperty({
    example: 'Внимательность, живой ум, отличная память',
    description: 'Основной текст',
  })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly content: string;
  @ApiProperty({ example: '1', description: 'Id картинки из БД' })
  @IsInt({ message: 'Значение должно быть числом' })
  readonly imageID?: number;
}

export class TextblockData {
  @ApiProperty({ example: '1', description: 'Id текстового блока' })
  @IsInt({ message: 'Значение должно быть числом' })
  readonly id: number;
  @ApiProperty({ example: 'title-block', description: 'Системное название' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly systemName?: string;
  @ApiProperty({ example: 'main', description: 'Где расположено' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly group?: string;
  @ApiProperty({ example: 'Наши приемущества', description: 'Заглавие' })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly title?: string;
  @ApiProperty({
    example: 'Внимательность, живой ум, отличная память',
    description: 'Основной текст',
  })
  @IsString({ message: 'Значение должно быть строкой' })
  readonly content?: string;
  @ApiProperty({ example: '1', description: 'Id картинки из БД' })
  @IsInt({ message: 'Значение должно быть числом' })
  readonly imageID?: number;
}
