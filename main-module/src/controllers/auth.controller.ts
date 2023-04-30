import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from "express";
import { firstValueFrom } from "rxjs";
import { Token } from '../../types/token'
import { LoginCouple } from '../../types/login-couple'
import { RegistrationData } from '../../types/registration-data'

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

  constructor(
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
      @Inject('DATA_SERVICE') private dataService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201, type: Token, description: 'Refresh token запишет в httpOnly куки' })
  @Post('registration')
  async registration(
      @Body() registrationData: RegistrationData, 
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken, id} = await firstValueFrom(this.accessService.send({cmd: 'registration'}, {email: registrationData.email, password: registrationData.password}));
      const profile = await firstValueFrom(this.dataService.send({cmd: 'create-profile'}, {id, name: registrationData.name, surname: registrationData.surname}));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      if (profile.id) {
      return {token: accessToken};
    }
  }

  @ApiOperation({ summary: 'Вход' })
  @ApiResponse({ status: 201, type: Token, description: 'Refresh token запишет в httpOnly куки' })
  @Post('login')
  async login(
      @Body() loginCouple: LoginCouple, 
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken} = await firstValueFrom(this.accessService.send({cmd: 'login'}, {email: loginCouple.email, password: loginCouple.password}));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return {token: accessToken};
  }

  @ApiOperation({ summary: 'Выход' })
  @ApiResponse({ status: 201, type: Boolean, description: 'Удалит refresh token из куков и из БД' })
  @Get('logout')
  async logout(
      @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ) {
    const { refreshToken } = request.cookies;
    response.clearCookie('refreshToken');
    const success =  await firstValueFrom(this.accessService.send({cmd: 'logout'}, refreshToken));
    return !!success;
  }

}