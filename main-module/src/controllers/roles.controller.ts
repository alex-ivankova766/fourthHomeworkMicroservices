import { Body, Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from "rxjs";
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, RoleCreationAttrs, RoleName } from 'types/role';

@ApiTags('Работа с ролями')
@Controller('roles')
export class RolesController {

  constructor(
      @Inject('ACCESS_SERVICE') private accessService: ClientProxy,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать роль' })
  @ApiResponse({ status: 201, type: Role, description: 'Создает роль' })
  @Get('create')
  async activate(
      @Body() attrs: RoleCreationAttrs,
  ) {
      const role = await firstValueFrom(this.accessService.send({ cmd: 'create-role' }, attrs));
      return role;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить данные о роли через название' })
  @ApiResponse({ status: 201, type: Role })
  @Get('get/:roleName')
  async getRoleByName(
    @Param('roleName') roleName: RoleName
  ) {
    const role = await firstValueFrom(this.accessService.send({ cmd: 'get-role-by-name' }, roleName));
    return role;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить данные о всех ролях' })
  @ApiResponse({ status: 201, type: [Role] })
  @Get('get/all')
  async getAllRoles(
  ) {
    const role = await firstValueFrom(this.accessService.send({ cmd: 'get-all-roles' }, {}));
    return role;
  }
}