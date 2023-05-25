import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoleCreationAttrs } from './roles.model';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @MessagePattern({ cmd: 'create-role' })
  async createRole(@Payload() attrs: RoleCreationAttrs) {
    return await this.rolesService.createRole(attrs);
  }

  @MessagePattern({ cmd: 'get-role-by-name' })
  async getRoleByName(@Payload() roleName: string) {
    return await this.rolesService.getRoleByName(roleName);
  }

  @MessagePattern({ cmd: 'get-all-roles' })
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }
}
