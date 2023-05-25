import { Controller, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokensService } from './tokens/tokens.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InitialService } from './initial/initial.service';
import { AuthVk } from '../classes/AuthVk.model';
import { VkoauthService } from './vkoauth/vkoauth.service';
import { GoogleService } from './googleoauth/google.service';
import { LoginUserDto } from '../classes/login-user';
import { ExceptionFilter } from './rpc-exception.filter';
import { InitCouple } from '../classes/init.couple';

@UseFilters(ExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private initialService: InitialService,
    private tokenService: TokensService,
    private authService: AuthService,
    private vkService: VkoauthService,
    private googleService: GoogleService,
  ) {}

  @MessagePattern({ cmd: 'vk-login' })
  async vkAuth(@Payload() auth: AuthVk) {
    return await this.vkService.loginVk(auth);
  }

  @MessagePattern({ cmd: 'google-login' })
  async googleAuthRedirect(@Payload() ticketPayload: any) {
    return await this.googleService.googleLogin(ticketPayload);
  }

  @MessagePattern({ cmd: 'verify-refresh-token' })
  async verifyRefreshToken(@Payload() token: string) {
    return await this.tokenService.validateRefreshToken(token);
  }

  @MessagePattern({ cmd: 'verify-access-token' })
  async verifyAccessToken(@Payload() token: string) {
    return await this.tokenService.validateAccessToken(token);
  }

  @MessagePattern({ cmd: 'update-refresh-token' })
  async updateToken(@Payload() { newData, id }) {
    return await this.tokenService.updateRefreshToken(newData, id);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Payload() refreshToken: string) {
    return await this.tokenService.refresh(refreshToken);
  }

  @MessagePattern({ cmd: 'init' })
  async init(@Payload() initCouple: InitCouple) {
    return await this.initialService.initial(initCouple);
  }

  @MessagePattern({ cmd: 'registration' })
  async registration(@Payload() createUserCouple: LoginUserDto) {
    return await this.authService.registration(createUserCouple);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() { email: userEmail, password: userPassword }) {
    return await this.authService.login(userEmail, userPassword);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() refreshToken: string) {
    return await this.authService.logout(refreshToken);
  }
}
