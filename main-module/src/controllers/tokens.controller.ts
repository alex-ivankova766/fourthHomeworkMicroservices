import { Controller, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from "express";
import { firstValueFrom } from "rxjs";
import { Token } from 'types/token';

@ApiTags('Работа с токенами')
@Controller('tokens')
export class TokensController {

  constructor(
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 201, type: Token, description: 'Refresh token запишет в httpOnly куки' })
  @Post('refresh')
  async refresh(
      @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ) {
      const { refreshToken } = request.cookies;
      const {accessToken, newRefreshToken} = await firstValueFrom(this.accessService.send({cmd: 'refresh'}, refreshToken));
      response.cookie('refreshToken', newRefreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return {token: accessToken};
  }
}