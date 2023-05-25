// eslint-disable-next-line prettier/prettier
import { Body, Controller, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ActivationLink } from '../../types/activation-link';
import { Token } from '../../types/token';
import { ChangeEmailCouple, ChangePassCouple } from '../../types/users-change';
import { RabbitMQClient } from '../rabbitmq.client';
import { AboutUser } from '../guards/aboutUser';

@ApiTags('Пользовательские данные')
@Controller('users')
export class UsersController {
  constructor(
    private rabbitMQClient: RabbitMQClient,
    private aboutUser: AboutUser,
  ) {}

  @ApiOperation({ summary: 'Активировать аккаунт' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 201, type: Token, description: 'Ссылка приходит на почту при регистрации. В токене и в юзере обновляется информация isActivated: true' })
  @Get('activate/:link')
  async activate(
    @Param('link') activationLink: ActivationLink,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.rabbitMQClient.activate(activationLink);
    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: tokens.accessToken };
  }

  @ApiOperation({ summary: 'Изменить почту' })
  @ApiResponse({ status: 201, type: Token })
  @Post('change/email:id')
  async changeEmail(
    @Body() changeEmailCouple: ChangeEmailCouple,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = await this.aboutUser.getUserId();
    const tokens = await this.rabbitMQClient.changeEmail(
      changeEmailCouple,
      userId == id,
    );
    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: tokens.accessToken };
  }

  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({ status: 201, type: Boolean })
  @Post('change-password')
  async changePassword(@Body() couple: ChangePassCouple) {
    const userId = await this.aboutUser.getUserId();
    return await this.rabbitMQClient.changePassword(userId, couple);
  }
}
