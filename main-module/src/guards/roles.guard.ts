import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { firstValueFrom } from "rxjs";
import { ROLES_KEY } from "./roles.decorator";
import { ClientProxy } from "@nestjs/microservices";


@Injectable()
export class RolesGuard implements CanActivate {

    constructor(@Inject('ACCESS_SERVICE') private readonly authService: ClientProxy, private reflector: Reflector) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
            if (!requiredRoles) {
                return true;  
            }
            const req = context.switchToHttp().getRequest();
            const { refreshToken } = req.cookies;

            const user = await firstValueFrom(this.authService.send( {cmd: 'verify-refresh-token'}, refreshToken));
            const access = user.roles.some(role => requiredRoles.includes(role.roleName));
            if (!access) throw new HttpException({message: 'Доступ запрещен'}, HttpStatus.FORBIDDEN);
            return true;

        } catch(e) {
            throw new HttpException({message: 'Доступ запрещен'}, HttpStatus.FORBIDDEN);
        }
        
    }
    
}