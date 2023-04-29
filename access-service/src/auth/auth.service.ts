import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs'
import {catchError, firstValueFrom, lastValueFrom, switchMap, of, throwError} from 'rxjs';
import { TokensService } from './tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
  private userService: UsersService,
  private tokenService: TokensService) {}

  async login(email: string, password: string, skipPasswordCheck: boolean = false) {

    const user = await this.defineUserExists(email);
    const userPassword = user?.password;
    const isRightPassword = await bcrypt.compare(password, userPassword);

    if (!isRightPassword && !skipPasswordCheck) {
      throw new BadRequestException("Invalid credentials");
    }
    const userData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(userData);
    return tokens;
  }

  async defineUserExists(email: string) : Promise<any> {

    const user = await this.userService.getUserByEmail(email)
    return user;
  }

  async registration(email: string, password: string) {
    if (await this.defineUserExists(email)) {
      throw new HttpException(`Пользователь с таким e-mail уже существует`, HttpStatus.NOT_FOUND);
    }

    const id = await this.userService.createUser(email, password)
    const user = await this.userService.getUserById(id)
    const userData = new UserDto(user)

    const tokens = await this.tokenService.generateAndSaveToken({...userData})

    return {refreshToken: tokens.refreshToken, accessToken: tokens.accessToken, id}
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
