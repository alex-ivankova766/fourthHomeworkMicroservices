import { ApiProperty } from '@nestjs/swagger';
import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

interface DbFilesCreationAttrs {
  fileName: string;
  path2File: string;
}

@Table({ tableName: 'files' })
export class DatabaseFile extends Model<DatabaseFile, DbFilesCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @AutoIncrement
  @Unique
  @PrimaryKey
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'UUID строка', description: 'UUID имя файла' })
  @Column({ type: DataType.STRING, allowNull: false })
  fileName: string;

  @ApiProperty({
    example: '/src/fdge43terg.jpg',
    description: 'Путь к файлу в fs',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  path2File: string;

  @ApiProperty({
    example: '35',
    description: 'Внутренний ID профиля',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  essenceId: number;

  @ApiProperty({
    example: '66',
    description: 'Внутренний ID таблицы',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  essenceTable: string;
}
