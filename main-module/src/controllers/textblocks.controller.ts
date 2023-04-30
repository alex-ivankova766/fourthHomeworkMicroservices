import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from "rxjs";
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateBlockData, TextblockData } from 'types/textblocks';

@ApiTags('Текстовые блоки')
@Controller('textblocks')
export class TextblocksController {

  constructor(
      @Inject('DATA_SERVICE') private dataService: ClientProxy
  ) {}

  @UseGuards(RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Просмотреть все текстовые блоки' })
  @ApiResponse({ status: 201, type: [TextblockData] })
  @Get('all')
  async getAllTextblocks(
  ) {
      const textblocks = await firstValueFrom(this.dataService.send({cmd: 'get-all-textblocks'}, {}));
      return textblocks;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать текстовый блок' })
  @ApiResponse({ status: 201, type: TextblockData })
  @Post('create')
  async createTextblock(
      @Body() textblockData: CreateBlockData
  ) {
      const textblock = await firstValueFrom(this.dataService.send({cmd: 'create-textblock'}, textblockData));
      return textblock;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Изменить текстовый блок' })
  @ApiResponse({ status: 201, type: TextblockData })
  @Post('change')
  async changeTextblock(
      @Body() newTextblockData: TextblockData
  ) {
      const textblock = await firstValueFrom(this.dataService.send({cmd: 'update-textblock'}, newTextblockData));
      return textblock;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить текстовый блок' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('delete/:id')
  async deleteTextblock(
    @Param('id') id: number,
  ) {
      const success = await firstValueFrom(this.dataService.send({cmd: 'delete-textblock'}, id));
      return !!success;
  }
}