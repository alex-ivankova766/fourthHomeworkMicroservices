import { Body, Controller, Get, Inject, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Token } from 'types/token';
import { Response } from "express";
import { firstValueFrom } from "rxjs";
import { InitCouple } from 'types/init.couple';

@ApiTags('Инициализация')
@Controller('init')
export class InitController {

  constructor(
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Инициализация сервера' })
  @ApiResponse({ status: 201, type: Token, description: 'Refresh token админа запишет в httpOnly куки' })
  @Post()
  async initialization(
      @Body() initCouple: InitCouple, 
      @Res({ passthrough: true }) response: Response
  ) {
      const {accessToken, refreshToken} = await firstValueFrom(this.accessService.send({cmd: 'init'}, {email: initCouple.email, password: initCouple.password}));
      response.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return {token: accessToken};
  }

}