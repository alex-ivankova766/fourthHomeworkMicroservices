import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { UserRoles } from './linkingTables/user-roles.model';

export class RoleCreationAttrs {
  roleName?: string;
  description?: string;
}
// export interface UpdateRoleAttrs = Partial<RoleCreationAttrs>;

@Table({ tableName: 'roles', createdAt: false, updatedAt: false })
export class Role extends Model<Role, RoleCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  roleId: number;

  @ApiProperty({ example: 'admin', description: 'User role' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  roleName: string;

  @ApiProperty({ example: 'Superuser', description: 'About role' })
  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @BelongsToMany(() => User, () => UserRoles)
  users: User[];
}
