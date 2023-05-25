import { Controller, Post, Req, Res } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import { ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Token } from '../../types/token';
import { RabbitMQClient } from '../rabbitmq.client';

@ApiTags('Работа с токенами')
@Controller('tokens')
export class TokensController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  @ApiOperation({ summary: 'Обновление токенов' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 201, type: Token, description: 'Refresh token запишет в httpOnly куки' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Ошибка авторизации' })
  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { refreshToken } = request.cookies;
    const { accessToken, newRefreshToken } = await this.rabbitMQClient.refresh(
      refreshToken,
    );
    response.cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: accessToken };
  }
}
