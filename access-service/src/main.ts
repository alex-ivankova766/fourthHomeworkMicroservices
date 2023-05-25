import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AccessModule } from './access.module';

async function runMicroservice() {
  const accessMicroservice = await NestFactory.createMicroservice(
    AccessModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.CLOUDAMQP_URL],
        queue: process.env.ACCESS_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await accessMicroservice.listen();
}
runMicroservice();
