import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateBlockData,
  TextBlock,
  UpdateBlockData,
} from './textblocks.model';
import { DatabaseFilesService } from 'src/databaseFiles/files.service';

@Injectable()
export class TextblocksService {
  constructor(
    @InjectModel(TextBlock) private blocksRepository: typeof TextBlock,
    private databaseFileService: DatabaseFilesService,
  ) {}

  async create(dto: CreateBlockData) {
    const block = await this.blocksRepository.create(dto);
    if (block.imageID) {
      const dbFile = await this.databaseFileService.getPhotoById(block.imageID);
      dbFile.essenceId = block.id;
      dbFile.essenceTable = 'textblocks';
      await dbFile.save();
    }
    return block.id;
  }

  async getAllBlocks() {
    return await this.blocksRepository.findAll();
  }

  async getBlocksByGroup(group) {
    return await this.blocksRepository.findAll({ where: { group: group } });
  }

  async updateBlock(newTextblockData: UpdateBlockData) {
    const block = await this.blocksRepository.findOne({
      where: { id: newTextblockData.id },
    });
    await block.update(newTextblockData);
    return block;
  }

  async deleteBlock(id: number) {
    const block = await this.blocksRepository.findOne({ where: { id: id } });
    if (block.imageID) {
      const file = await this.databaseFileService.getPhotoById(block.imageID);
      file.essenceId = null;
      file.essenceTable = null;
      await file.save();
    }
    return !!(await this.blocksRepository.destroy({ where: { id: id } }));
  }
}
