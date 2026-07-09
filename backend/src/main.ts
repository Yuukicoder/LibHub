import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {  ConfigService } from '@nestjs/config';
import {ValidationPipe} from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  const port = configService.get<number>("port") ?? 3000;
  
  await app.listen(port);
  console.log(`Library Hub is running at http://localhost:${port}/api`);

}
bootstrap();
