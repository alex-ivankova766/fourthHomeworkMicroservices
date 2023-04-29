import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { refs } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { SelfAccess } from "src/exceptions/selfAccess";

@Injectable()
export class AdminSelfGuard implements CanActivate {
    
    constructor(@Inject('ACCESS_SERVICE') private readonly authService: ClientProxy) {
    }

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest()
        const reqEmail = req.body.email;
        req.cookie('selfRequest', true, {maxAge: 1 * 60 * 1000, httpOnly: true});

        try { 
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw new SelfAccess()
            }

            const user = await firstValueFrom(this.authService.send( {cmd: 'verify-refresh-token'}, refreshToken));
            if (user.email == process.env.OWNER_MAIL) {
                req.cookie('selfRequest', false, {maxAge: 1 * 60 * 1000, httpOnly: true});
                return true;
            }
            if (user.email != reqEmail) {
                throw new SelfAccess()
            }
            return true;
        } catch(e) {
            throw new SelfAccess()     
        }
    }
    
}