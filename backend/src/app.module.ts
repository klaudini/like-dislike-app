import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";
import { CharactersModule } from "./characters/characters.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI, {
      retryAttempts: 3,
      retryDelay: 1000,
    }),

    // Tasa de limitacion en tiempo
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000, // 60 seg
        limit: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 req
      },
    ]),

    // Módulo de los personajes
    CharactersModule,
  ],
})
export class AppModule {}
