import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { TokensService } from 'src/auth/tokens/tokens.service';
import { UserDto } from 'src/dtos/user.dto';

@Injectable()
export class InitialService {    
    constructor(
    private roleService: RolesService,
    private userService: UsersService,
    private tokenService: TokensService
    ) {}

    async createRoot(email: string, password: string, rootRole: string) {

        const rootId = await this.userService.createUser(email, password);

        const root = await this.userService.getUserById(rootId);
        const role = await this.roleService.getRoleByName(rootRole);
        await root.$add('roles', [role]);
        root.roles = [role];    

        const rootDto = new UserDto(root);
        const rootTokens = await this.tokenService.generateAndSaveToken(rootDto);
        return rootTokens;
    }
    async initial(email: string, password: string) {
        const baseRole = await this.roleService.getRoleByName('user');

        if (baseRole) {
            throw new HttpException(`Service already initialized`, HttpStatus.BAD_REQUEST);
        }
        await this.roleService.createRole({roleName: "owner", description: "Superuser"});
        await this.roleService.createRole({roleName: "admin", description: "Admin"});
        await this.roleService.createRole({roleName: "user", description: "Standart role"});

        const adminCandidate = await this.userService.getUserByEmail(email);
        let adminTokens;
        
        if (adminCandidate) {
            const userData = new UserDto(adminCandidate)
            adminTokens = await this.tokenService.generateAndSaveToken( userData )
            
            return {accessToken: adminTokens.accessToken, refreshToken: adminTokens.refreshToken};
        }

        await this.createRoot(process.env.OWNER_MAIL, process.env.OWNER_PASSWORD, "owner");
        adminTokens = await this.createRoot(email, password, "admin");

        return {accessToken: adminTokens.accessToken, refreshToken: adminTokens.refreshToken};
}}
