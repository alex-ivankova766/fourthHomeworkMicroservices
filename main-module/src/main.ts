import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';

async function runServer() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(ApiModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Microservices by Alex Ivankova')
    .setDescription('Перед началом работы необходима инициализация сервера')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  await app.listen(process.env.INSIDE_PORT, () => console.log(`Server started on PORT ${process.env.OUTSIDE_PORT}...`))
}
runServer();
