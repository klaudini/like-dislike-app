import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({ 
    description: 'ID externo del personaje (ej: rick-1, pokemon-25, hero-644)',
    example: 'pokemon-25'
  })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ 
    description: 'Tipo de voto',
    enum: ['like', 'dislike'],
    example: 'like'
  })
  @IsEnum(['like', 'dislike'])
  @IsNotEmpty()
  voteType: 'like' | 'dislike';

  @ApiProperty({ 
    description: 'Nombre del personaje',
    example: 'Pikachu'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'URL de la imagen del personaje',
    example: 'https://...'
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ 
    description: 'Categoría del personaje',
    enum: ['rickandmorty', 'pokemon', 'superhero'],
    example: 'pokemon'
  })
  @IsEnum(['rickandmorty', 'pokemon', 'superhero'])
  @IsNotEmpty()
  category: 'rickandmorty' | 'pokemon' | 'superhero';

  @ApiProperty({ 
    description: 'Metadata adicional del personaje',
    required: false,
    example: { species: 'Mouse Pokemon', type: 'Electric' }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CharacterResponseDto {
  @ApiProperty({ example: 'pokemon-25' })
  externalId: string;

  @ApiProperty({ example: 'Pikachu' })
  name: string;

  @ApiProperty({ example: 'https://...' })
  image: string;

  @ApiProperty({ enum: ['rickandmorty', 'pokemon', 'superhero'] })
  category: string;

  @ApiProperty({ example: 0 })
  likes: number;

  @ApiProperty({ example: 0 })
  dislikes: number;

  @ApiProperty({ example: 0 })
  totalVotes?: number;

  @ApiProperty({ example: 0 })
  likePercentage?: number;

  @ApiProperty()
  lastEvaluated: Date;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;
}

export class StatsResponseDto {
  @ApiProperty({ description: 'Personaje con más likes' })
  mostLiked: CharacterResponseDto | null;

  @ApiProperty({ description: 'Personaje con más dislikes' })
  mostDisliked: CharacterResponseDto | null;

  @ApiProperty({ description: 'Último personaje evaluado' })
  lastEvaluated: CharacterResponseDto | null;

  @ApiProperty({ description: 'Total de personajes evaluados' })
  totalCharacters: number;

  @ApiProperty({ description: 'Total de votos (likes + dislikes)' })
  totalVotes: number;
}

export class PikachuStatusDto {
  @ApiProperty({ description: 'Indica si Pikachu existe en la base de datos' })
  exists: boolean;

  @ApiProperty({ description: 'Datos de Pikachu si existe', required: false })
  data?: CharacterResponseDto;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  message: string;
}
