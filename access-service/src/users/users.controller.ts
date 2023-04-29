import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService,
    ) {}
    
    @MessagePattern({ cmd: 'change-email' })
    async changeEmail(
        @Payload() {email, newEmail}

    ) {
        return await this.userService.updateUserEmail(email, newEmail); 
    }

    @MessagePattern({ cmd: 'change-password' })
    async changePassword(
        @Payload() {email, newPassword, oldPassword}
    ) {
        return await this.userService.updateUserPassword(email, newPassword, oldPassword); 
    }

    @MessagePattern({ cmd: 'delete-user' })
    async deleteUser(
        @Payload() email

    ) {
        return await this.userService.deleteUserByEmail(email); 
    }
}
