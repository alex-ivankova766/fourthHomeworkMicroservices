import { Role } from "src/roles/roles.model";

export class UserDto {

    readonly email: string;
    readonly id: number;
    readonly roles: [Role];

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.roles = model.roles;
    }
}