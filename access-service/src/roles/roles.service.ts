import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role, RoleCreationAttrs } from './roles.model';

@Injectable()
export class RolesService {

    constructor(@InjectModel(Role) private roleRepository: typeof Role,
    ) {}

    async createRole(attrs: RoleCreationAttrs) {
        const role = await this.roleRepository.create(attrs);
        return role;
    } 

    async getRoleByName(roleName: string) {
        const role = await this.roleRepository.findOne({where: {roleName: roleName}})
        return role;
    }

    async getAllRoles() {
        const roles = await this.roleRepository.findAll();
        return roles;
    }
}