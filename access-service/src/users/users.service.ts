import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcryptjs'
import { UserExists } from 'src/exceptions/userExists';
import { UnInitialized } from 'src/exceptions/notInitialized';
import { UserNotExists } from 'src/exceptions/userNotExists';
import { UserOrRoleNotFound } from 'src/exceptions/userRoleNotFound';
import { LoginCouple } from 'src/classes/login-couple';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private readonly roleService: RolesService,
    ) {}

    async createUser(email: string, password: string): Promise<number> {
        const baseRole = await this.roleService.getRoleByName('user');

        if (!baseRole) {
            throw new UnInitialized();
        }

        const candidate = await this.getUserByEmail( email );

        if (candidate) {
            throw new UserExists(email);
        }

        const hashPassword = await bcrypt.hash(password, +process.env.SALT)

        let user = await this.userRepository.create( {email: email, password: hashPassword} );
        await user.$set('roles', [baseRole]);
        return user.id;
    }

    private async validateUser(couple: LoginCouple) {
        const user = await this.getUserByEmail(couple.email);
        let passwordEquals;
        if (user) {
            passwordEquals = await bcrypt.compare(couple.password, user.password);
        }

        if (passwordEquals) {
            return user;
        }
        else {
            throw new UnauthorizedException({message: 'E-mail или password не верны'})
        }
    }

    async getAllUsers() {
        return await this.userRepository.findAll({ include: { all: true } });
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email: email }, include: { all: true } });
        return (user)? user : null;
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: { id: id }, include: { all: true } });
        return (user)? user : null;
    }

    async updateUserEmail(email: string, newEmail: string) {
        const user = await this.getUserByEmail(email)
        if (!user) {
            throw new UserNotExists(email);
        }
        user['email'] = newEmail
        await user.save();
        return user;
    }

    async updateUserPassword(email: string, newPassword: string, oldPassword: string) {
        const user = await this.validateUser({email, password: oldPassword})
        if (!user) {
            throw new UserNotExists(email);
        }
        user['password'] = await bcrypt.hash(newPassword, +process.env.SALT)
        await user.save();
        return user;
    }

    async deleteUserByEmail(email: string) {
        const user = await this.getUserByEmail(email)

        if (!user) {
            throw new UserNotExists(email);
        }

        await user.destroy();
    }

    async addRole(roleName: string, id: number) {
        const role = await this.roleService.getRoleByName(roleName);
        const user = await this.getUserById(id);

        if (role && user) {
            await user.$add('roles', role);
            return user;
        }
        
        throw new UserOrRoleNotFound();
    }

    async addRoleByEmail(roleName: string, email: string) {
        const role = await this.roleService.getRoleByName(roleName);
        const user = await this.getUserByEmail(email);

        if (role && user) {
            await user.$add('roles', role);
            return user;
        }
        
        throw new UserOrRoleNotFound();
    }
}
