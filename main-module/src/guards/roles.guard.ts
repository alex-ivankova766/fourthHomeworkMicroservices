import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RabbitMQClient } from '../../src/rabbitmq.client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private rabbitMQClient: RabbitMQClient,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new HttpException(
          { message: 'Доступ запрещен' },
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.rabbitMQClient.verifyAccessToken(token);

      const access = user.roles.some((role) =>
        requiredRoles.includes(role.roleName),
      );
      if (!access)
        throw new HttpException(
          { message: 'Доступ запрещен' },
          HttpStatus.FORBIDDEN,
        );
      return true;
    } catch (e) {
      throw new HttpException(
        { message: 'Доступ запрещен' },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
