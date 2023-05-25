import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  async googleLogin(ticketPayload) {
    if (!ticketPayload) {
      return 'No user from google';
    }

    const [email, firstName, lastName, avatarLink] = [
      ticketPayload.email,
      ticketPayload.given_name,
      ticketPayload.family_name,
      ticketPayload.picture,
    ];
    let candidate = await this.userService.getUserByEmail(email);
    if (!candidate) {
      const tokens = await this.authService.registration(
        { email: email, password: null },
        true,
      );
      candidate = await this.userService.getUserByEmail(email);

      const profileData = {
        userId: candidate.id,
        name: firstName,
        lastName: lastName,
      };
      return { profileData, avatarLink, tokens };
    }
  }
}
