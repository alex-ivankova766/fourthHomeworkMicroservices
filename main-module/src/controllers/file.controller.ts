// eslint-disable-next-line prettier/prettier
import { Body, Controller, Delete, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../src/guards/roles.decorator';
import { RolesGuard } from '../../src/guards/roles.guard';
import { AvatarPathId, Link } from '../../types/path2file';
import { RabbitMQClient } from '../rabbitmq.client';

@ApiTags('Работа с файлами')
@Controller('files')
export class FilesController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary: `Удалить файлы неиспользующиеся более ${process.env.REQ_TIME} милисекунд` })
  @ApiResponse({ status: 201, type: Boolean, description: 'Успешный запрос' })
  @Delete('clean')
  async cleanFiles() {
    return await this.rabbitMQClient.cleanFiles();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Загрузить файл' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 201, type: AvatarPathId, description: 'Успешный запрос' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@UploadedFile() file) {
    return await this.rabbitMQClient.uploadFile(file);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Загрузить аватар по ссылке' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 201, type: AvatarPathId, description: 'Успешный запрос' })
  @Post('upload_avatar_by_link')
  async uploadAvatarByLink(@Body() link: Link): Promise<AvatarPathId> {
    return await this.rabbitMQClient.uploadAvatarByLink(link);
  }
}
