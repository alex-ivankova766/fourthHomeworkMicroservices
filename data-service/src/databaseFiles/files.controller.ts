import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseFilesService } from './files.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('files')
@ApiTags('Files')
export class DbFilesController {
  constructor(private dbFilesService: DatabaseFilesService) {}

  @MessagePattern({ cmd: 'clean-files' })
  async cleanUnusedFiles() {
    return await this.dbFilesService.cleanUnusedFiles();
  }

  @MessagePattern({ cmd: 'set-avatar' })
  async setAvatar(@Payload() { id, avatarId }) {
    return await this.dbFilesService.setPhoto(id, avatarId);
  }

  @MessagePattern({ cmd: 'get-avatar' })
  async getAvatar(@Payload() { id }) {
    return await this.dbFilesService.getPhoto(id);
  }

  @MessagePattern({ cmd: 'unset-avatar' })
  async unsetAvatar(@Payload() id: number) {
    return await this.dbFilesService.unSetPhoto(id);
  }

  @MessagePattern({ cmd: 'upload-photo' })
  async uploadFile(@Payload() file) {
    const buffer = Buffer.from(file.buffer);
    return await this.dbFilesService.uploadPhoto(buffer);
  }

  @MessagePattern({ cmd: 'upload-photo-by-link' })
  async uploadFileByLink(@Payload() link: string) {
    return await this.dbFilesService.uploadPhotoByLink(link);
  }
}
