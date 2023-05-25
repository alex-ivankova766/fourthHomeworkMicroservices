import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProfileCreatingAttrs } from './profile.model';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @MessagePattern({ cmd: 'create-profile' })
  async create(@Payload() createAttrs: ProfileCreatingAttrs) {
    return await this.profileService.createProfile(createAttrs);
  }

  @MessagePattern({ cmd: 'update-profile' })
  async update(@Payload() { profileData, id }) {
    return await this.profileService.updateProfile(profileData, id);
  }

  @MessagePattern({ cmd: 'get-all-profiles' })
  async getAllProfiles() {
    return await this.profileService.getAllProfiles();
  }

  @MessagePattern({ cmd: 'delete-profile' })
  async delete(@Payload() id) {
    return await this.profileService.deleteProfile(id);
  }
}
