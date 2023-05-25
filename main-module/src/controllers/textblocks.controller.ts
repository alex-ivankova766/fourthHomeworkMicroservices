// eslint-disable-next-line prettier/prettier
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Roles } from '../../src/guards/roles.decorator';
import { RolesGuard } from '../../src/guards/roles.guard';
import { CreateBlockData, TextblockData } from '../../types/textblocks';
import { RabbitMQClient } from '../rabbitmq.client';

@ApiTags('Текстовые блоки')
@Controller('textblocks')
export class TextblocksController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  @UseGuards(RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Просмотреть все текстовые блоки' })
  @ApiResponse({ status: 201, type: [TextblockData] })
  @Get('all')
  async getAllTextblocks() {
    return this.getAllTextblocks();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать текстовый блок' })
  @ApiResponse({ status: 201, type: TextblockData })
  @Post('create')
  async createTextblock(@Body() textblockData: CreateBlockData) {
    return this.rabbitMQClient.createTextblock(textblockData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Изменить текстовый блок' })
  @ApiResponse({ status: 201, type: TextblockData })
  @Post('change')
  async changeTextblock(@Body() newTextblockData: TextblockData) {
    return this.rabbitMQClient.changeTextblock(newTextblockData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить текстовый блок' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('delete/:id')
  async deleteTextblock(@Param('id') id: number) {
    return this.rabbitMQClient.deleteTextblock(id);
  }
}
