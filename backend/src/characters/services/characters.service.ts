import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character, CharacterDocument } from '../entities/character.entity';
import { ExternalApisService } from './external-apis.service';
import { VoteDto, CharacterResponseDto, StatsResponseDto, PikachuStatusDto } from '../dto/character.dto';
import { NormalizedCharacter } from '../interfaces/external-apis.interface';

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);

  constructor(
    @InjectModel(Character.name)
    private characterModel: Model<CharacterDocument>,
    private externalApisService: ExternalApisService,
  ) {}

  /**
   * Obtiene un personaje aleatorio de las APIs externas
   */
  async getRandomCharacter(): Promise<NormalizedCharacter> {
    this.logger.log('Getting random character from external APIs');
    return this.externalApisService.getRandomCharacter();
  }

  /**
   * Registra un voto (like o dislike) para un personaje
   */
  async vote(voteDto: VoteDto): Promise<CharacterResponseDto> {
    const { externalId, voteType, name, image, category, metadata } = voteDto;

    this.logger.log(`Processing ${voteType} for character: ${externalId}`);

    try {
      // Buscar si el personaje ya existe en la BD
      let character = await this.characterModel.findOne({ externalId });

      if (character) {
        // Si existe, actualizar el contador correspondiente
        if (voteType === 'like') {
          character.likes += 1;
        } else {
          character.dislikes += 1;
        }
        character.lastEvaluated = new Date();
        await character.save();
      } else {
        // Si no existe, crear nuevo documento
        character = await this.characterModel.create({
          externalId,
          name,
          image,
          category,
          likes: voteType === 'like' ? 1 : 0,
          dislikes: voteType === 'dislike' ? 1 : 0,
          lastEvaluated: new Date(),
          metadata,
        });
      }

      return this.mapToResponseDto(character);
    } catch (error) {
      this.logger.error('Error processing vote', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas generales
   */
  async getStats(): Promise<StatsResponseDto> {
    this.logger.log('Getting general statistics');

    const [mostLiked, mostDisliked, lastEvaluated, totalCharacters, votesAggregation] = 
      await Promise.all([
        this.characterModel.findOne().sort({ likes: -1 }).exec(),
        this.characterModel.findOne().sort({ dislikes: -1 }).exec(),
        this.characterModel.findOne().sort({ lastEvaluated: -1 }).exec(),
        this.characterModel.countDocuments().exec(),
        this.characterModel.aggregate([
          {
            $group: {
              _id: null,
              totalVotes: { $sum: { $add: ['$likes', '$dislikes'] } },
            },
          },
        ]),
      ]);

    const totalVotes = votesAggregation[0]?.totalVotes || 0;

    return {
      mostLiked: mostLiked ? this.mapToResponseDto(mostLiked) : null,
      mostDisliked: mostDisliked ? this.mapToResponseDto(mostDisliked) : null,
      lastEvaluated: lastEvaluated ? this.mapToResponseDto(lastEvaluated) : null,
      totalCharacters,
      totalVotes,
    };
  }

  /**
   * Obtiene el personaje con más likes
   */
  async getMostLiked(): Promise<CharacterResponseDto> {
    this.logger.log('Getting most liked character');
    
    const character = await this.characterModel
      .findOne()
      .sort({ likes: -1 })
      .exec();

    if (!character) {
      throw new NotFoundException('No hay personajes evaluados todavía');
    }

    return this.mapToResponseDto(character);
  }

  /**
   * Obtiene el personaje con más dislikes
   */
  async getMostDisliked(): Promise<CharacterResponseDto> {
    this.logger.log('Getting most disliked character');
    
    const character = await this.characterModel
      .findOne()
      .sort({ dislikes: -1 })
      .exec();

    if (!character) {
      throw new NotFoundException('No hay personajes evaluados todavía');
    }

    return this.mapToResponseDto(character);
  }

  /**
   * Obtiene el último personaje evaluado
   */
  async getLastEvaluated(): Promise<CharacterResponseDto> {
    this.logger.log('Getting last evaluated character');
    
    const character = await this.characterModel
      .findOne()
      .sort({ lastEvaluated: -1 })
      .exec();

    if (!character) {
      throw new NotFoundException('No hay personajes evaluados todavía');
    }

    return this.mapToResponseDto(character);
  }

  /**
   * Obtiene el estatus de Pikachu
   */
  async getPikachuStatus(): Promise<PikachuStatusDto> {
    this.logger.log('Checking Pikachu status');

    const pikachu = await this.characterModel.findOne({ externalId: 'pokemon-25' });

    if (!pikachu) {
      return {
        exists: false,
        message: 'Pikachu aún no ha sido evaluado. ¡Sé el primero en votar por él!',
      };
    }

    return {
      exists: true,
      data: this.mapToResponseDto(pikachu),
      message: `Pikachu ha sido evaluado ${pikachu.likes + pikachu.dislikes} veces`,
    };
  }

  /**
   * Obtiene todos los personajes evaluados (opcional, para debugging)
   */
  async getAllCharacters(): Promise<CharacterResponseDto[]> {
    const characters = await this.characterModel.find().sort({ lastEvaluated: -1 });
    return characters.map(char => this.mapToResponseDto(char));
  }

  /**
   * Mapea un documento de MongoDB a DTO de respuesta
   */
  private mapToResponseDto(character: CharacterDocument): CharacterResponseDto {
    return {
      externalId: character.externalId,
      name: character.name,
      image: character.image,
      category: character.category,
      likes: character.likes,
      dislikes: character.dislikes,
      totalVotes: character.likes + character.dislikes,
      likePercentage: this.calculateLikePercentage(character.likes, character.dislikes),
      lastEvaluated: character.lastEvaluated,
      metadata: character.metadata,
    };
  }

  /**
   * Calcula el porcentaje de likes
   */
  private calculateLikePercentage(likes: number, dislikes: number): number {
    const total = likes + dislikes;
    return total > 0 ? Math.round((likes / total) * 100) : 0;
  }
}
