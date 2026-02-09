import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CharactersController } from "./controllers/characters.controller";
import { CharactersService } from "./services/characters.service";
import { ExternalApisService } from "./services/external-apis.service";
import { Character, CharacterSchema } from "./entities/character.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
    ]),
    HttpModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService, ExternalApisService],
  exports: [CharactersService],
})
export class CharactersModule {}
