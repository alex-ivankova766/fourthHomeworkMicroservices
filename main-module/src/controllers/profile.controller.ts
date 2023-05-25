// eslint-disable-next-line prettier/prettier
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Roles } from '../../src/guards/roles.decorator';
import { RolesGuard } from '../../src/guards/roles.guard';
import { ProfileUpdatingAttrs } from '../../types/change-profile';
import { AvatarPathId } from '../../types/path2file';
import { Profile } from '../../types/profile';
import { RabbitMQClient } from '../rabbitmq.client';
import { AboutUser } from '../guards/aboutUser';

@ApiTags('Личные данные')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private rabbitMQClient: RabbitMQClient,
    private aboutUser: AboutUser,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Просмотреть все профили' })
  @ApiResponse({ status: 201, type: [Profile] })
  @Get('all')
  async getAllProfiles() {
    const profiles = await this.rabbitMQClient.getAllProfiles();
    return profiles;
  }

  @ApiOperation({ summary: 'Изменить профиль' })
  @ApiResponse({ status: 201 })
  @Post('change')
  async changeProfile(@Body() profileData: ProfileUpdatingAttrs) {
    const userId = await this.aboutUser.getUserId();
    return await this.rabbitMQClient.changeProfile(userId, profileData);
  }

  @ApiOperation({ summary: 'Удалить профиль' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('delete')
  async deleteProfile(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { refreshToken } = request.cookies;
    response.clearCookie('refreshToken');
    const userId = await this.aboutUser.getUserId();
    return await this.rabbitMQClient.deleteProfile(userId, refreshToken);
  }

  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary: 'Удалить аватар профиля по id, может только сам пользователь' })
  @ApiResponse({ status: 201, type: Boolean, description: 'Успешный запрос' })
  @ApiNotFoundResponse({ status: 404, description: 'Профиль не найден' })
  @Get('/unset_avatar/:id')
  async unsetAvatar(@Param('id', ParseIntPipe) id: number) {
    const userId = await this.aboutUser.getUserId();
    return await this.rabbitMQClient.unsetAvatar(id, userId);
  }

  @UseGuards(RolesGuard)
  @Roles('user')
  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary:'Получить аватар профиля по id, для авторизованных пользователей' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 201, type: AvatarPathId, description: 'Успешное выполнение' })
  @ApiNotFoundResponse({ status: 404, description: 'Аватар не найден' })
  @Get('/avatar/:id')
  async getAvatar(@Param('id', ParseIntPipe) id: number) {
    return await this.rabbitMQClient.getAvatar(id);
  }
}
