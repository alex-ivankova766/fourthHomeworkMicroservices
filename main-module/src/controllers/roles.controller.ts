import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, RoleCreationAttrs, RoleName } from 'types/role';
import { RabbitMQClient } from '../rabbitmq.client';

@ApiTags('Работа с ролями')
@Controller('roles')
export class RolesController {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать роль' })
  @ApiResponse({ status: 201, type: Role, description: 'Создает роль' })
  @Get('create')
  async createRole(@Body() attrs: RoleCreationAttrs) {
    return this.rabbitMQClient.createRole(attrs);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить данные о роли через название' })
  @ApiResponse({ status: 201, type: Role })
  @Get('get/:roleName')
  async getRoleByName(@Param('roleName') roleName: RoleName) {
    return this.rabbitMQClient.getRoleByName(roleName);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить данные о всех ролях' })
  @ApiResponse({ status: 201, type: [Role] })
  @Get('get/all')
  async getAllRoles() {
    return this.rabbitMQClient.getAllRoles();
  }
}
