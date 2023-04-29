import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { User } from './users/users.model';
import { Role } from './roles/roles.model';
import { UserRoles } from './roles/linkingTables/user-roles.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `../.env`
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_ACCESS_DB,
      models: [User, Role, UserRoles],
      autoLoadModels: true,
    }),
    AuthModule,
    UsersModule,
    RolesModule
]
})
export class AccessModule {}
