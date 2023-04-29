import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { SelfAccess } from "src/exceptions/selfAccess";

@Injectable()
export class SelfGuard implements CanActivate {
    
    constructor(@Inject('ACCESS_SERVICE') private readonly authService: ClientProxy) {
    }

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest()
        const reqId = req.body.id;

        try { 
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw new SelfAccess()
            }

            const user = await firstValueFrom(this.authService.send( {cmd: 'verify-refresh-token'}, refreshToken));

            if (user.id != reqId) {
                throw new SelfAccess()
            }
            return true;
        } catch(e) {
            throw new SelfAccess()     
        }
    }
    
}