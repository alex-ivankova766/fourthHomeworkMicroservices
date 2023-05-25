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

export class ProfileUpdatingAttrs {
  name?: string;
  surname?: string;
  phone?: string;
}

export class ProfileCreatingAttrs {
  id: number;
  name?: string;
  surname?: string;
  phone?: string;
  avatarId: number;
}

@Table({ tableName: 'profiles', createdAt: false, updatedAt: false })
export class Profile extends Model<Profile> {
  @ApiProperty({
    example: '1',
    description: 'Уникальный идентификатор поль-ля',
  })
  @AutoIncrement
  @Unique
  @PrimaryKey
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Александра', description: 'Имя' })
  @Column({ type: DataType.STRING })
  name: string;

  @ApiProperty({ example: 'Иванкова', description: 'Фамилия' })
  @Column({ type: DataType.STRING })
  surname: string;

  @ApiProperty({ example: '2128506', description: 'Телефон' })
  @Column({ type: DataType.STRING })
  phone: string;

  @ApiProperty({ example: '17', description: 'ID аватара' })
  @Column({ type: DataType.STRING })
  avatarId: number;
}
