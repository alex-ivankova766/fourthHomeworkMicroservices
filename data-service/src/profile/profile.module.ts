import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './profile.model';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports:[SequelizeModule.forFeature([Profile])]
})
export class ProfileModule {}
