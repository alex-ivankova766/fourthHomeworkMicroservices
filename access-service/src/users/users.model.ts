import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/linkingTables/user-roles.model';

interface UserCreationAttrs {
  email: string;
  password: string;
  activationLink: string;
  vk_id?: number;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  userId: number;

  @ApiProperty({
    example: '121523',
    description: 'Уникальный идентификатор ВК',
  })
  @Column({ type: DataType.INTEGER, unique: true, allowNull: true })
  vk_id: number;

  @ApiProperty({ example: 'name@post.ru', description: 'E-mail адрес' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({ example: '********', description: 'Пароль' })
  @Column({ type: DataType.STRING, allowNull: true })
  password: string;

  @ApiProperty({ example: 'false', description: 'Активирован ли аккаунт' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isActivated: boolean;

  @ApiProperty({ example: '', description: 'Постфикс ссылки активации' })
  @Column({ type: DataType.STRING, allowNull: false })
  activationLink: string;

  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];
}
