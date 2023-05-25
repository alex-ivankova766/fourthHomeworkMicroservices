import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Token } from '../../types/token';
import { Response } from 'express';
import { InitCouple } from '../../types/init.couple';
import { AllExceptionsFilter } from '../exceptions/filter';
import { RabbitMQClient } from '../rabbitmq.client';

@UseFilters(AllExceptionsFilter)
@ApiTags('Инициализация')
@Controller('init')
export class InitController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary: 'Инициализация сервера, Refresh token админа запишет в httpOnly куки' })
  @ApiOkResponse({ status: 200, type: Token, description: 'Успешный запрос' })
  @ApiForbiddenResponse({ status: 403, description: 'Повторный вызов' })
  // eslint-disable-next-line prettier/prettier
  @ApiNotFoundResponse({ status: 404, description: 'Не найдены переменные среды' })
  @Post()
  async init(
    @Body() initCouple: InitCouple,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.rabbitMQClient.init(
      initCouple,
    );
    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: accessToken };
  }
}
