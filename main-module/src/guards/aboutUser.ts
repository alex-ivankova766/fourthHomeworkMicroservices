// eslint-disable-next-line prettier/prettier
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RabbitMQClient } from 'src/rabbitmq.client';

export class AboutUser {
  constructor(
    private rabbitMQClient: RabbitMQClient,
    private context: ExecutionContext,
  ) {}

  async getUserId() {
    const req = this.context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    try {
      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new HttpException(
          { message: 'Доступ запрещен' },
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.rabbitMQClient.verifyAccessToken(token);
      return user.id;
    } catch {
      throw new HttpException(
        { message: 'Доступ запрещен' },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
