import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
    ) {}
    
    @MessagePattern({ cmd: 'create-profile' })
    async create(
        @Payload() {id, name, surname}

    ) {
        return await this.profileService.create(id, name, surname); 
    }

    @MessagePattern({ cmd: 'update-profile' })
    async update(
        @Payload() {profileData, id}

    ) {
        return await this.profileService.update(profileData, id); 
    }

    @MessagePattern({ cmd: 'get-all-profiles' })
    async getAllProfiles(
    ) {
        return await this.profileService.getAllProfiles();
    }

    @MessagePattern({ cmd: 'delete-profile' })
    async delete(
        @Payload() id

    ) {
        return await this.profileService.delete(id); 
    }
}
