import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [RolesModule, SequelizeModule.forFeature([User])],
})
export class UsersModule {}
