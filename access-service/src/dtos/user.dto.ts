import { Role } from 'src/roles/roles.model';

export class UserDto {
  readonly email: string;
  readonly id: number;
  readonly roles: [Role];
  readonly isActivated: boolean;

  constructor(model) {
    this.email = model.email;
    this.id = model.userId;
    this.roles = model.roles;
    this.isActivated = model.isActivated;
  }
}
