import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DatabaseFile } from 'src/databaseFiles/files.model';

export class CreateBlockData {
  readonly systemName: string;
  readonly group: string;
  readonly title: string;
  readonly content: string;
  readonly imageID?: number;
}

export class UpdateBlockData {
  readonly id: number;
  readonly systemName?: string;
  readonly group?: string;
  readonly title?: string;
  readonly content?: string;
  readonly imageID?: number;
}

interface BlockCreationAttrs {
  systemName: string;
  group: string;
  content: string;
}

@Table({ tableName: 'textblocks' })
export class TextBlock extends Model<TextBlock, BlockCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'main-hero-text',
    description: 'Unique title for the search',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  systemName: string;

  @ApiProperty({ example: 'main-page', description: 'Search group' })
  @Column({ type: DataType.STRING, allowNull: false })
  group: string;

  @ApiProperty({ example: 'Our advantages', description: 'Title' })
  @Column({ type: DataType.STRING, allowNull: true })
  title: string;

  @ApiProperty({
    example: 'JWT.IO allows you to decode, verify and generate JWT.',
    description: 'Text block content',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  content: string;

  @ApiProperty({ description: 'ID image from database' })
  @ForeignKey(() => DatabaseFile)
  @Column({ type: DataType.INTEGER })
  imageID: number;
}
