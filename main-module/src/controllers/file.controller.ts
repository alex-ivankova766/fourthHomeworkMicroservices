import { Controller, Delete, Inject, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from "rxjs";
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileId } from 'types/file-id';



@ApiTags('Работа с файлами')
@Controller('files')
export class FilesController {

  constructor(
      @Inject('DATA_SERVICE') private dataService: ClientProxy
  ) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить неиспользуемые файлы' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('clean')
  async cleanFiles(
  ) {
      return await firstValueFrom(this.dataService.send({ cmd: 'clean-files' }, {}));
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiResponse({ status: 201, type: FileId })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(
    @UploadedFile() file
  ) {
      const fileId = await firstValueFrom(this.dataService.send({cmd: 'upload-file'}, file));
      return {id: fileId};
  }
}