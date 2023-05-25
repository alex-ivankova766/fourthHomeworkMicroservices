import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokensService } from './tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { UserDto } from '../dtos/user.dto';
import { LoginUserDto } from '../classes/login-user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokensService,
  ) {}

  async login(
    loginCouple: Partial<LoginUserDto>,
    skipPasswordCheck = false,
    id: number = null,
  ) {
    this.checkLoginData(loginCouple, skipPasswordCheck);
    const user = id
      ? await this.userService.getUserById(id)
      : await this.userService.getUserByEmail(loginCouple.email);

    if (!user) {
      throw new HttpException(
        `Пользователя с email ${loginCouple.email} не существует`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userPassword = user.password;
    let isRightPassword;
    if (userPassword) {
      isRightPassword = await bcrypt.compare(
        loginCouple.password,
        userPassword,
      );
    }

    if (!isRightPassword && !skipPasswordCheck) {
      throw new HttpException('Неверный пароль', HttpStatus.UNAUTHORIZED);
    }
    const tokenData = new UserDto(user);
    const tokens = await this.tokenService.generateAndSaveToken(tokenData);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async defineUserExists(email: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    return user;
  }

  async registration(
    createUserCouple: LoginUserDto,
    skipPasswordCheck = false,
  ) {
    if (await this.defineUserExists(createUserCouple.email)) {
      throw new HttpException(
        `Пользователь с таким e-mail уже существует`,
        HttpStatus.NOT_FOUND,
      );
    }
    this.checkLoginData(createUserCouple, skipPasswordCheck);

    const user = await this.userService.createUser(createUserCouple);

    const tokens = await this.login(
      createUserCouple,
      skipPasswordCheck,
      user.id,
    );

    return {
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    };
  }

  async logout(refreshToken) {
    return await this.tokenService.removeToken(refreshToken);
  }

  checkLoginData(loginData: Partial<LoginUserDto>, skipPasswordCheck: boolean) {
    if (
      // если эту проверку можно реализовать на клиенте, то там ей быть логичнее (skipPass передаётся при oauth через сторонние сервисы)
      (loginData.email === null || loginData.password === null) &&
      skipPasswordCheck === false
    )
      throw new HttpException(
        `Email и пароль необходимы для регистрации`,
        HttpStatus.BAD_REQUEST,
      );
  }
}
