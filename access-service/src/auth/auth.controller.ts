import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokensService } from './tokens/tokens.service';
// import { VkoauthService } from './vkoauth/vkoauth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InitialService } from './initial/initial.service';

@Controller('auth')
export class AuthController {
    constructor(
        private initialService: InitialService,
        private tokenService: TokensService,
        private authService: AuthService
    ) {}
    
    @MessagePattern({ cmd: 'verify-refresh-token' })
    async verifyToken(
        @Payload() token: string
    ) {
        return await this.tokenService.validateRefreshToken(token); 
    }

    @MessagePattern({ cmd: 'update-refresh-token' })
    async updateToken(
        @Payload() {newData, id}
    ) {
        return await this.tokenService.updateRefreshToken(newData, id); 
    }

    @MessagePattern({ cmd: 'refresh' })
    async refresh(
        @Payload() refreshToken : string
    ) {
        return await this.tokenService.refresh(refreshToken); 
    }

    @MessagePattern({ cmd: 'init' })
    async init(
        @Payload() {email: adminEmail, password: adminPassword}
    ) {

        return await this.initialService.initial(adminEmail, adminPassword); 
    }

    @MessagePattern({ cmd: 'registration' })
    async registration(
        @Payload() {email: userEmail, password: userPassword}
    ) {
        return await this.authService.registration(userEmail, userPassword); 
    }

    @MessagePattern({ cmd: 'login' })
    async login(
        @Payload() {email: userEmail, password: userPassword}
    ) {
        return await this.authService.login(userEmail, userPassword); 
    }

    @MessagePattern({ cmd: 'logout' })
    async logout(
        @Payload() refreshToken: string
    ) {
        return await this.authService.logout(refreshToken); 
    }


}
