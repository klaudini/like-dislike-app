import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // manejo de errores
  app.useGlobalFilters(new AllExceptionsFilter());

  // helmet para headers seguros
  app.use(helmet());

  // CORS configurado desde variables de entorno
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Validación global de DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma payloads a instancias de DTO
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Like/Dislike API')
    .setDescription('API para sistema de votación de personajes de Rick and Morty, Pokémon y Superhéroes')
    .setVersion('1.0')
    .addTag('characters', 'Endpoints relacionados con personajes')
    .addTag('stats', 'Endpoints de estadísticas y reportes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  Corriendo en: http://localhost:${port}
  Swagger: http://localhost:${port}/api/docs
  CORS habilitado para: ${corsOrigins.join(', ')}
  `);
}

bootstrap();
