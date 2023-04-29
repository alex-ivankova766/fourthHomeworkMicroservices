import { Body, Controller, Get, Inject, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from "express";
import { firstValueFrom } from "rxjs";
import { AdminSelfGuard } from 'src/guards/adminSelfEmail.guard';
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { SelfGuard } from 'src/guards/selfId.guard';
import { ProfileUpdatingAttrs } from 'types/change-profile';
import { Profile } from 'types/profile';



@ApiTags('Личные данные')
@Controller('profiles')
export class ProfilesController {

  constructor(
      @Inject('DATA_SERVICE') private dataService: ClientProxy,
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Просмотреть все профили' })
  @ApiResponse({ status: 201, type: [Profile] })
  @Get('all')
  async getAllProfiles(
  ) {
      const profiles = await firstValueFrom(this.dataService.send({cmd: 'get-all-profiles'}, {}));
      return profiles;
  }

  @ApiOperation({ summary: 'Изменить профиль' })
  @ApiResponse({ status: 201 })
  @Post('change')
  async changeProfile(
      @Body() profileData: ProfileUpdatingAttrs,
      @Req() request: Request
  ) {
      const { refreshToken } = request.cookies;
      const userData =  await firstValueFrom(this.accessService.send({cmd: 'verify-refresh-token'}, refreshToken));
      const profile = await firstValueFrom(this.dataService.send({cmd: 'update-profile'}, {profileData, id: userData.id}));
      return profile;
  }

  @ApiOperation({ summary: 'Удалить профиль' })
  @ApiResponse({ status: 201, type: Boolean })
  @Post('delete')
  async deleteProfile(
      @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ) {
      const { refreshToken } = request.cookies;
      const userData =  await firstValueFrom(this.accessService.send({cmd: 'verify-refresh-token'}, refreshToken));
      await this.dataService.send({cmd: 'delete-profile'}, userData.id);
      await this.accessService.send({cmd: 'delete-user'}, userData.email);
      response.clearCookie('refreshToken');
      const success =  await firstValueFrom(this.accessService.send({cmd: 'logout'}, refreshToken));
      return !!success;
  }
}