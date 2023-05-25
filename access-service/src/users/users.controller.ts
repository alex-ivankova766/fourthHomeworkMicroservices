import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @MessagePattern({ cmd: 'change-email' })
  async changeEmail(@Payload() { email, newEmail }) {
    return await this.userService.updateUserEmail(email, newEmail);
  }

  @MessagePattern({ cmd: 'activate' })
  async activate(@Payload() activationLink: string) {
    return await this.userService.activate(activationLink);
  }

  @MessagePattern({ cmd: 'change-password' })
  async changePassword(@Payload() { id, newPassword, oldPassword }) {
    return await this.userService.updateUserPassword(id, {
      newPassword,
      oldPassword,
    });
  }

  @MessagePattern({ cmd: 'delete-user' })
  async deleteUser(@Payload() email) {
    return await this.userService.deleteUserById(email);
  }
}
