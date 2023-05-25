import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line prettier/prettier
import { ProfileRegistrationData, RegistrationData } from 'types/registration-data';
import { LoginCouple } from 'types/login-couple';
import { AuthVk } from 'types/AuthVk.model';
import { Token } from 'types/token';
import { OAuth2Client } from 'google-auth-library';
import { AvatarPathId, Link } from 'types/path2file';
import { InitCouple } from 'types/init.couple';
import { ProfileUpdatingAttrs } from 'types/change-profile';
import { RoleCreationAttrs, RoleName } from 'types/role';
import { CreateBlockData, TextblockData } from 'types/textblocks';
import { ActivationLink } from 'types/activation-link';
import { ChangeEmailCouple, ChangePassCouple } from 'types/users-change';

@Injectable()
export class RabbitMQClient {
  private accessClient: ClientProxy;
  private dataClient: ClientProxy;
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET,
  );

  constructor() {
    this.accessClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL],
        queue: process.env.ACCESS_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    });
    this.dataClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL],
        queue: process.env.DATA_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async registration(createUserData: RegistrationData) {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.accessClient.send({ cmd: 'registration' }, createUserData),
    );
    const user = await this.verifyAccessToken(accessToken);
    await this.createProfile({ id: user.id, ...createUserData });
    return { accessToken, refreshToken };
  }

  private async createProfile(
    profileRegistrationData: ProfileRegistrationData,
  ) {
    return await firstValueFrom(
      this.dataClient.send({ cmd: 'create-profile' }, profileRegistrationData),
    );
  }

  async login(loginCouple: LoginCouple) {
    return await firstValueFrom(
      this.accessClient.send({ cmd: 'login' }, loginCouple),
    );
  }

  private async createProfileWithAvatar(profileData, avatarLink: string) {
    const avatarData = avatarLink
      ? await firstValueFrom(
          this.dataClient.send({ cmd: 'upload-avatar-by-link' }, avatarLink),
        )
      : null;

    profileData.avatarId = avatarData.avatarId;

    await firstValueFrom(
      this.dataClient.send({ cmd: 'create-profile' }, profileData),
    );
  }

  async loginVk(auth: AuthVk) {
    const { profileData, avatarLink, tokens } = await firstValueFrom(
      this.accessClient.send({ cmd: 'vk-login' }, auth),
    );
    await this.createProfileWithAvatar(profileData, avatarLink);
    return tokens;
  }

  async loginGoogle(token: Token) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { profileData, avatarLink, tokens } = await firstValueFrom(
      this.accessClient.send({ cmd: 'google-login' }, ticket.getPayload()),
    );
    await this.createProfileWithAvatar(profileData, avatarLink);
    return tokens;
  }

  async logout(refreshToken) {
    return await firstValueFrom(
      this.accessClient.send({ cmd: 'logout' }, refreshToken),
    );
  }

  async verifyAccessToken(token) {
    return await firstValueFrom(
      this.accessClient.send({ cmd: 'verify-access-token' }, token),
    );
  }

  async cleanFiles() {
    return await firstValueFrom(
      this.dataClient.send({ cmd: 'clean-files' }, {}),
    );
  }

  async uploadFile(file) {
    const avatarPathId = await firstValueFrom(
      this.dataClient.send({ cmd: 'upload-photo' }, file),
    );
    return avatarPathId;
  }

  async uploadAvatarByLink(link: Link): Promise<AvatarPathId> {
    const avatarPathId: AvatarPathId = await firstValueFrom(
      this.dataClient.send({ cmd: 'upload-photo-by-link' }, link.link),
    );
    return avatarPathId;
  }

  async init(initCouple: InitCouple) {
    await firstValueFrom(
      this.dataClient.send({ cmd: 'create-profile' }, { id: 1 }),
    );
    await firstValueFrom(
      this.dataClient.send({ cmd: 'create-profile' }, { id: 2 }),
    );
    return await firstValueFrom(
      this.accessClient.send({ cmd: 'init' }, initCouple),
    );
  }

  async getAllProfiles() {
    return await firstValueFrom(
      this.dataClient.send({ cmd: 'get-all-profiles' }, {}),
    );
  }

  async changeProfile(userId: number, profileData: ProfileUpdatingAttrs) {
    const profile = await firstValueFrom(
      this.dataClient.send(
        { cmd: 'update-profile' },
        { profileData, id: userId },
      ),
    );
    return profile;
  }

  async deleteProfile(userId: number, refreshToken: string) {
    await this.dataClient.send({ cmd: 'delete-profile' }, userId);
    await this.accessClient.send({ cmd: 'delete-user' }, userId);
    const success = await firstValueFrom(
      this.accessClient.send({ cmd: 'logout' }, refreshToken),
    );
    return !!success;
  }

  async unsetAvatar(id: number, userId: number) {
    if (id != userId) {
      return false;
    }
    await firstValueFrom(this.dataClient.send({ cmd: 'unset-avatar' }, id));
    return true;
  }

  async getAvatar(id: number) {
    const { path2File, avatarId } = await firstValueFrom(
      this.dataClient.send({ cmd: 'get-avatar' }, id),
    );
    return { path2File, avatarId };
  }

  async createRole(attrs: RoleCreationAttrs) {
    const role = await firstValueFrom(
      this.accessClient.send({ cmd: 'create-role' }, attrs),
    );
    return role;
  }

  async getRoleByName(roleName: RoleName) {
    const role = await firstValueFrom(
      this.accessClient.send({ cmd: 'get-role-by-name' }, roleName),
    );
    return role;
  }

  async getAllRoles() {
    const role = await firstValueFrom(
      this.accessClient.send({ cmd: 'get-all-roles' }, {}),
    );
    return role;
  }

  async getAllTextblocks() {
    const textblocks = await firstValueFrom(
      this.dataClient.send({ cmd: 'get-all-textblocks' }, {}),
    );
    return textblocks;
  }

  async createTextblock(textblockData: CreateBlockData) {
    const textblock = await firstValueFrom(
      this.dataClient.send({ cmd: 'create-textblock' }, textblockData),
    );
    return textblock;
  }

  async changeTextblock(newTextblockData: TextblockData) {
    const textblock = await firstValueFrom(
      this.dataClient.send({ cmd: 'update-textblock' }, newTextblockData),
    );
    return textblock;
  }

  async deleteTextblock(id: number) {
    const success = await firstValueFrom(
      this.dataClient.send({ cmd: 'delete-textblock' }, id),
    );
    return !!success;
  }

  async refresh(refreshToken) {
    return await firstValueFrom(
      this.accessClient.send({ cmd: 'refresh' }, refreshToken),
    );
  }

  async activate(activationLink: ActivationLink) {
    const user = await firstValueFrom(
      this.accessClient.send({ cmd: 'activate' }, activationLink),
    );
    const tokens = await firstValueFrom(
      this.accessClient.send(
        { cmd: 'update-refresh-token' },
        { newData: { isActivated: true }, id: user.id },
      ),
    );
    return tokens;
  }

  async changeEmail(changeEmailCouple: ChangeEmailCouple, access: boolean) {
    if (!access) {
      throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
    }
    const user = await firstValueFrom(
      this.accessClient.send({ cmd: 'change-email' }, changeEmailCouple),
    );
    const tokens = await firstValueFrom(
      this.accessClient.send(
        { cmd: 'update-refresh-token' },
        { newData: { email: user.email }, id: user.id },
      ),
    );
    return tokens;
  }

  async changePassword(id: number, couple: ChangePassCouple) {
    await firstValueFrom(
      this.accessClient.send(
        { cmd: 'change-password' },
        {
          id: id,
          oldPassword: couple.oldPassword,
          newPassword: couple.newPassword,
        },
      ),
    );
  }
}
