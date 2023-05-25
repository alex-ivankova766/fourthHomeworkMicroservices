import { Module } from '@nestjs/common';
import { TextblocksService } from './textblocks.service';
import { TextblocksController } from './textblocks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TextBlock } from './textblocks.model';
import { DatabaseFilesModule } from 'src/databaseFiles/files.module';

@Module({
  providers: [TextblocksService],
  controllers: [TextblocksController],
  imports: [SequelizeModule.forFeature([TextBlock]), DatabaseFilesModule],
})
export class TextblocksModule {}
