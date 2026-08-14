import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for SPA frontend interaction
  app.enableCors();
  
  // Use Global Pipes for validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Simple Restaurant ERP Backend is running on: http://localhost:${port}`);
}
bootstrap();
