import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CharactersService } from '../services/characters.service';
import { 
  VoteDto, 
  CharacterResponseDto, 
  StatsResponseDto,
  PikachuStatusDto,
} from '../dto/character.dto';
import { NormalizedCharacter } from '../interfaces/external-apis.interface';

@ApiTags('characters')
@Controller('characters')
@UseGuards(ThrottlerGuard) // Rate limiting en todos los endpoints
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  /**
   * Obtiene un personaje aleatorio para evaluar
   */
  @Get('random')
  @ApiOperation({ 
    summary: 'Obtiene un personaje aleatorio',
    description: 'Retorna un personaje aleatorio de Rick and Morty, Pokémon o Superhéroes para ser evaluado',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personaje obtenido exitosamente',
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Servicio externo no disponible',
  })
  async getRandomCharacter(): Promise<NormalizedCharacter> {
    return this.charactersService.getRandomCharacter();
  }

  /**
   * Registra un voto (like o dislike)
   */
  @Post('vote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registra un voto para un personaje',
    description: 'Permite dar like o dislike a un personaje. Si es la primera vez que se evalúa, lo crea en la base de datos.',
  })
  @ApiBody({ type: VoteDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Voto registrado exitosamente',
    type: CharacterResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos',
  })
  async vote(@Body() voteDto: VoteDto): Promise<CharacterResponseDto> {
    return this.charactersService.vote(voteDto);
  }

  /**
   * Obtiene estadísticas generales
   */
  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtiene estadísticas generales',
    description: 'Retorna el personaje más votado positivamente, más votado negativamente, último evaluado y totales',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    type: StatsResponseDto,
  })
  async getStats(): Promise<StatsResponseDto> {
    return this.charactersService.getStats();
  }

  /**
   * Obtiene el personaje con más likes
   */
  @Get('most-liked')
  @ApiOperation({ 
    summary: 'Obtiene el personaje con más likes',
    description: 'Retorna el personaje que ha recibido más votos positivos',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personaje más votado obtenido exitosamente',
    type: CharacterResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No hay personajes evaluados todavía',
  })
  async getMostLiked(): Promise<CharacterResponseDto> {
    return this.charactersService.getMostLiked();
  }

  /**
   * Obtiene el personaje con más dislikes
   */
  @Get('most-disliked')
  @ApiOperation({ 
    summary: 'Obtiene el personaje con más dislikes',
    description: 'Retorna el personaje que ha recibido más votos negativos',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personaje más rechazado obtenido exitosamente',
    type: CharacterResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No hay personajes evaluados todavía',
  })
  async getMostDisliked(): Promise<CharacterResponseDto> {
    return this.charactersService.getMostDisliked();
  }

  /**
   * Obtiene el último personaje evaluado
   */
  @Get('last-evaluated')
  @ApiOperation({ 
    summary: 'Obtiene el último personaje evaluado',
    description: 'Retorna el personaje más recientemente evaluado',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Último personaje evaluado obtenido exitosamente',
    type: CharacterResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No hay personajes evaluados todavía',
  })
  async getLastEvaluated(): Promise<CharacterResponseDto> {
    return this.charactersService.getLastEvaluated();
  }

  /**
   * Obtiene el estatus de Pikachu
   */
  @Get('pikachu/status')
  @ApiOperation({ 
    summary: 'Obtiene el estatus de Pikachu',
    description: 'Verifica si Pikachu ha sido evaluado y retorna sus estadísticas completas',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatus de Pikachu obtenido exitosamente',
    type: PikachuStatusDto,
  })
  async getPikachuStatus(): Promise<PikachuStatusDto> {
    return this.charactersService.getPikachuStatus();
  }

  /**
   * Endpoint opcional para debugging - obtiene todos los personajes
   */
  @Get('all')
  @ApiOperation({ 
    summary: '[DEBUG] Obtiene todos los personajes evaluados',
    description: 'Retorna lista completa de personajes en la base de datos (útil para debugging)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de personajes obtenida exitosamente',
    type: [CharacterResponseDto],
  })
  async getAllCharacters(): Promise<CharacterResponseDto[]> {
    return this.charactersService.getAllCharacters();
  }
}
