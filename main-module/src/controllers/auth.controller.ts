// eslint-disable-next-line prettier/prettier
import { Body, Controller, Get, Post, Req, Res, UseFilters, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import { ApiBadRequestResponse, ApiConflictResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Token } from '../../types/token';
import { LoginCouple } from '../../types/login-couple';
import { RegistrationData } from '../../types/registration-data';
import { AuthVk } from '../../types/AuthVk.model';
import { AllExceptionsFilter } from '../../src/exceptions/filter';
import { RabbitMQClient } from '../rabbitmq.client';

@UseFilters(AllExceptionsFilter)
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary: 'Регистрация, Refresh token запишет в httpOnly куки' })
  @ApiOkResponse({ status: 201, type: Token, description: 'Успешный запрос' })
  // eslint-disable-next-line prettier/prettier
  @ApiConflictResponse({ status: 409, description: 'Пользователь уже существует' })
  // eslint-disable-next-line prettier/prettier
  @ApiBadRequestResponse({ status: 424, description: 'Инициализация сервера не выполнена!' })
  // eslint-disable-next-line prettier/prettier
  @ApiInternalServerErrorResponse({ status: 500, description: 'Ошибка при создании пользователя/профиля' })
  @Post('registration')
  async registration(
    @Body(ValidationPipe)
    registrationData: RegistrationData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.rabbitMQClient.registration(registrationData);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: accessToken };
  }

  @ApiOperation({ summary: 'Вход, Refresh token запишет в httpOnly куки' })
  @ApiOkResponse({ status: 200, type: Token, description: 'Успешный запрос' })
  @ApiNotFoundResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Неверный пароль' })
  @Post('login')
  async login(
    @Body() loginCouple: LoginCouple,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.rabbitMQClient.login(
      loginCouple,
    );
    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token: accessToken };
  }

  @ApiOperation({ summary: 'Выход, удалит refresh token из куков и из БД' })
  @ApiOkResponse({ status: 201, type: Boolean, description: 'Успешный запрос' })
  @Get('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { refreshToken } = request.cookies;
    response.clearCookie('refreshToken');
    const success = await this.rabbitMQClient.logout(refreshToken);
    return !!success;
  }
  // eslint-disable-next-line prettier/prettier
  @ApiOperation({summary: `Вход через ВК, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer`,})
  @ApiResponse({ status: 200, type: Token, description: 'Успешный запрос' })
  // eslint-disable-next-line prettier/prettier
  @ApiBadRequestResponse({ status: 400, description: 'Плохой вк-код либо ошибка при получении данных с ВК' })
  // eslint-disable-next-line prettier/prettier
  @ApiInternalServerErrorResponse({ status: 500, description: 'Ошибка при создании пользователя/профиля' })
  @Post('vk')
  async vkLogin(
    @Body() auth: AuthVk,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Token> {
    const tokens = await this.rabbitMQClient.loginVk(auth);
    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      token: tokens.accessToken,
    };
  }

  // eslint-disable-next-line prettier/prettier
  @ApiOperation({ summary: `Вход через google, Refresh token записывается в куки. Access token возвращается, он должен ставиться в заголовок Authorization и иметь тип Bearer` })
  @ApiResponse({ status: 200, type: Token, description: 'Успешный запрос' })
  @Post('google')
  async googleLogin(
    @Body() token: Token,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Token> {
    const tokens = await this.rabbitMQClient.loginGoogle(token);
    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      token: tokens.accessToken,
    };
  }
}
