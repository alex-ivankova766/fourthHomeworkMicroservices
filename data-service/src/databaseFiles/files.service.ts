import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { HttpService } from '@nestjs/axios';
import { DatabaseFile } from './files.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DatabaseFilesService {
  constructor(
    @InjectModel(DatabaseFile) private dbFilesRepository: typeof DatabaseFile,
    private http: HttpService,
  ) {}

  uploadPath = path.resolve(__dirname, '..', 'upload');

  async uploadPhotoByLink(link: string): Promise<{ avatarId; path2File }> {
    try {
      const avatar = await firstValueFrom(
        this.http.get(link, {
          responseType: 'text',
          responseEncoding: 'base64',
        }),
      );
      const { avatarId, path2File } = await this.uploadPhoto(
        Buffer.from(avatar.data, 'base64'),
      );

      return { avatarId, path2File };
    } catch (e) {
      console.log(`[UPLOAD][BYLINK][ERROR] ${e}`);
      throw new HttpException(
        'Ошибка при записи файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadPhoto(fileContent: Buffer): Promise<{ avatarId; path2File }> {
    try {
      const fileName = uuid.v4() + '.jpg';

      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }
      const path2file = path.join(this.uploadPath, fileName);
      fs.writeFileSync(path2file, fileContent);

      const dbFile = await this.dbFilesRepository.create({
        fileName: fileName,
        path2File: path2file,
      });
      return { avatarId: dbFile.id, path2File: path2file };
    } catch (e) {
      console.log(`[UPLOAD][FILE][ERROR] ${e}`);
      throw new HttpException(
        'Ошибка при записи файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPhotoById(id: number) {
    try {
      return await this.dbFilesRepository.findOne({
        where: { id: id },
      });
    } catch (e) {
      throw new HttpException(
        'Ошибка при обращении к базе данных',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setPhoto(id: number, avatarId: number): Promise<string> {
    try {
      const avatar = await this.getPhotoById(avatarId);
      avatar['essenceProfileId'] = id;
      avatar['essenceTable'] = 'profile';
      await avatar.save();
      return avatar.path2File;
    } catch (e) {
      throw new HttpException(
        'Ошибка при присваивании аватара',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getPhoto(id: number): Promise<object> {
    try {
      const avatar = await this.dbFilesRepository.findOne({
        where: { essenceTable: 'profile', essenceId: id },
      });
      return { path2File: avatar.path2File, avatarId: avatar.id };
    } catch (e) {
      throw new HttpException(
        'Ошибка при получении аватара',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async unSetPhoto(id: number): Promise<boolean> {
    const files = await this.dbFilesRepository.findAll({
      where: { essenceTable: 'profile', essenceId: id },
    });
    if (files) {
      for (const file of files) {
        file['essenceProfileId'] = null;
        await file.save();
        return true;
      }
    }
    return false;
  }

  async cleanUnusedFiles() {
    const REQUIRED_TIME = new Date(Date.now() - +process.env.REQ_TIME);
    try {
      const files = await this.dbFilesRepository.findAll({
        where: {
          essenceId: null,
          essenceTable: null,
          createdAt: { [Op.lte]: REQUIRED_TIME },
        },
      });
      for (const file of files) {
        this.deleteFile(file.fileName);
      }
    } catch (e) {
      console.log(`[FILES][SERVICE][CLEAN] ${e}`);
      throw new HttpException(
        'Ошибка при очистке файлов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return true;
  }

  private async deleteFile(fileName: string) {
    try {
      const filePath = path.join(this.uploadPath, fileName);
      fs.unlinkSync(filePath);
      const file = await this.dbFilesRepository.findOne({
        where: { path2File: filePath },
      });
      await file.destroy();
    } catch (e) {
      console.log(`[FILES][SERVICE][DELETE] ${e}`);
      throw new HttpException(
        'Ошибка при удалении файлов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
