import { Body, Controller, Get, Inject, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from "express";
import { firstValueFrom } from "rxjs";
import { AdminSelfGuard } from 'src/guards/adminSelfEmail.guard';
import { Token } from 'types/token';
import { ChangeEmailCouple, ChangePassCouple } from 'types/users-change';


@ApiTags('Пользовательские данные')
@Controller('users')
export class UsersController {

  constructor(
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
  ) {}
  @UseGuards(AdminSelfGuard)
  @ApiOperation({ summary: 'Изменить почту' })
  @ApiResponse({ status: 201, type: Token })
  @Post('change')
  async changeEmail(
      @Body() changeEmailCouple: ChangeEmailCouple,
      @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ) {
      const { needCookies } = request.cookies;
      const user = await firstValueFrom(this.accessService.send({ cmd: 'change-email' }, changeEmailCouple));
      const tokens = await firstValueFrom(this.accessService.send({ cmd: 'update-refresh-token' }, {newData: { email: user.email }, id: user.id}));
      if (needCookies) response.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return {token: tokens.accessToken};

  }

  @UseGuards(AdminSelfGuard)
  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({ status: 201, type: Boolean })
  @Post('change-password')
  async changePassword(
    @Body() couple: ChangePassCouple,
    @Req() request: Request
    ) {
    const { refreshToken } = request.cookies;
    const userData =  await firstValueFrom(this.accessService.send({cmd: 'verify-refresh-token'}, refreshToken));
    const user = await firstValueFrom(this.accessService.send({cmd: 'change-password'}, {email: userData.email, oldPassword: couple.oldPassword, newPassword: couple.newPassword}));
    return (user)? true : false
  }
}