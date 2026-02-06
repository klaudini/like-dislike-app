import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CharactersController } from "./controllers/characters.controller";
import { CharactersService } from "./services/characters.service";
import { ExternalApisService } from "./services/external-apis.service";
import { Character, CharacterSchema } from "./entities/character.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
    ]),
  ],
  controllers: [CharactersController],
  providers: [CharactersService, ExternalApisService],
  exports: [CharactersService],
})
export class CharactersModule {}
