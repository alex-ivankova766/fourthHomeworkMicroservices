import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Profile,
  ProfileCreatingAttrs,
  ProfileUpdatingAttrs,
} from './profile.model';
import { DatabaseFilesService } from 'src/databaseFiles/files.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private profileRepository: typeof Profile,
    private fileService: DatabaseFilesService,
  ) {}

  async createProfile(createData): Promise<Profile> {
    try {
      const profile = await this.profileRepository.create(createData);
      if (createData.avatarId) {
        await this.fileService.setPhoto(profile.id, createData.avatarId);
      }
      return profile;
    } catch (e) {
      throw new HttpException(
        'Ошибка при создании профиля',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    try {
      return await this.profileRepository.findAll();
    } catch (e) {
      throw new HttpException(
        'Ошибка при обращении к базе данных',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfileByUserId(id: number): Promise<Profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: id },
      });
      if (profile) return profile;
    } catch (e) {
      throw new HttpException(
        'Ошибка при обращении к базе данных',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(
    updateData: ProfileUpdatingAttrs,
    id: number,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id: id } });
    await profile.update(updateData);
    return profile;
  }

  async updateAvatar(id: number, dto: { avatarId: number }): Promise<Profile> {
    const profile = await this.getProfileByUserId(id);
    await this.fileService.unSetPhoto(profile.id);
    await this.fileService.setPhoto(profile.id, dto.avatarId);
    return await profile.update(dto);
  }

  async deleteAvatar(id: number): Promise<Profile> {
    const profile = await this.getProfileByUserId(id);
    await this.fileService.unSetPhoto(profile.id);
    return await profile.update({ avatarId: null });
  }

  async deleteProfile(id): Promise<any> {
    const profile = await this.profileRepository.destroy({ where: { id: id } });
    return profile;
  }
}
