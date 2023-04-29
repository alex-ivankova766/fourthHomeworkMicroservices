import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DataModule } from './data.module';

async function runMicroservice() {
  const dataMicroservice = await NestFactory.createMicroservice(DataModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.CLOUDAMQP_URL],
      queue: process.env.DATA_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  });
  await dataMicroservice.listen();
}
runMicroservice();