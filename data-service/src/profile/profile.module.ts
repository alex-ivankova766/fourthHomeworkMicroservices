import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './profile.model';
import { DatabaseFilesModule } from 'src/databaseFiles/files.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports: [
    SequelizeModule.forFeature([Profile]),
    DatabaseFilesModule,
    HttpModule,
  ],
})
export class ProfileModule {}
