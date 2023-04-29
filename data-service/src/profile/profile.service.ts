import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Profile, ProfileUpdatingAttrs } from './profile.model';

@Injectable()
export class ProfileService {


    constructor(
        @InjectModel(Profile) private profileRepository: typeof Profile
    ) {}

    async create( id: number, name: string, surname: string ): Promise<Profile> {
        return await this.profileRepository.create( {id, name, surname} );
    }

    async getAllProfiles(): Promise<Profile[]> {
        return await this.profileRepository.findAll();
    }

    async update( profileData: ProfileUpdatingAttrs, id ): Promise<Profile> {
        const profile = await this.profileRepository.findOne({ where: { id: id }});
        await profile.update(profileData);
        return profile;
    }
    async delete( id ): Promise<any> {
        const profile = await this.profileRepository.destroy({ where: { id: id }});
        return profile;
    }
}
