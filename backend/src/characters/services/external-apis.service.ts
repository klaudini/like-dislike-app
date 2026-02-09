import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import {
  NormalizedCharacter,
  PokemonCharacter,
  SuperheroCharacter,
} from "@/characters/interfaces/external-apis.interface";
import axios, { AxiosInstance } from "axios";

export class ExternalApisService {
  private readonly logger = new Logger(ExternalApisService.name);
  private readonly axiosInstance: AxiosInstance;

  // URLs base de las APIs
  private readonly RICK_MORTY_API = "https://rickandmortyapi.com/api";
  private readonly POKEMON_API = "https://pokeapi.co/api/v2";
  private readonly SUPERHERO_API = "https://superheroapi.com/api";

  // ✅ AGREGAR: Cache de personajes recientes
  private recentCharacters: string[] = [];
  private readonly MAX_RECENT = 10;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Verifica si un personaje fue mostrado recientemente
   */
  private wasRecentlyShown(externalId: string): boolean {
    return this.recentCharacters.includes(externalId);
  }

  /**
   * Agrega personaje a la lista de recientes
   */
  private addToRecent(externalId: string): void {
    this.recentCharacters.push(externalId);
    if (this.recentCharacters.length > this.MAX_RECENT) {
      this.recentCharacters.shift(); // Eliminar el más viejo
    }
  }

  /**
   * Obtiene un personaje aleatorio de cualquier categoría (sin repetir recientes)
   */
  async getRandomCharacter(): Promise<NormalizedCharacter> {
    const categories = ["rickandmorty", "pokemon", "superhero"];
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      this.logger.log(
        `Getting random character from category: ${randomCategory} (attempt ${attempt + 1})`,
      );

      let character: NormalizedCharacter;

      switch (randomCategory) {
        case "rickandmorty":
          character = await this.getRandomRickAndMortyCharacter();
          break;
        case "pokemon":
          character = await this.getRandomPokemon();
          break;
        case "superhero":
          character = await this.getRandomSuperhero();
          break;
        default:
          throw new HttpException(
            "Categoría inválida",
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }

      // Verificar si fue mostrado recientemente
      if (!this.wasRecentlyShown(character.externalId)) {
        this.addToRecent(character.externalId);
        return character;
      }

      this.logger.log(
        `Character ${character.externalId} was recently shown, trying again...`,
      );
    }

    // Si después de 5 intentos no encuentra uno nuevo, retornar cualquiera
    this.logger.warn(
      "Could not find a unique character after 5 attempts, returning any",
    );
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    switch (randomCategory) {
      case "rickandmorty":
        return this.getRandomRickAndMortyCharacter();
      case "pokemon":
        return this.getRandomPokemon();
      case "superhero":
        return this.getRandomSuperhero();
    }
  }

  /**
   * Obtiene un personaje aleatorio de Rick and Morty
   */
  async getRandomRickAndMortyCharacter(): Promise<NormalizedCharacter> {
    try {
      const randomId = Math.floor(Math.random() * 826) + 1;
      const url = `${this.RICK_MORTY_API}/character/${randomId}`;

      this.logger.log(`Fetching Rick and Morty character: ${url}`);
      const response = await this.axiosInstance.get(url);
      const character = response.data;

      return {
        externalId: `rick-${character.id}`,
        name: character.name,
        image: character.image,
        category: "rickandmorty",
        metadata: {
          status: character.status,
          species: character.species,
          gender: character.gender,
          origin: character.origin.name,
          location: character.location.name,
        },
      };
    } catch (error) {
      this.logger.error("Error fetching Rick and Morty character", error);
      throw new HttpException(
        "Error al obtener personaje de Rick and Morty",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Obtiene un Pokémon aleatorio
   */
  async getRandomPokemon(): Promise<NormalizedCharacter> {
    try {
      const randomId = Math.floor(Math.random() * 1010) + 1;
      const url = `${this.POKEMON_API}/pokemon/${randomId}`;

      this.logger.log(`Fetching Pokemon: ${url}`);
      const response = await this.axiosInstance.get<PokemonCharacter>(url);
      const pokemon = response.data;

      const image =
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default;

      return {
        externalId: `pokemon-${pokemon.id}`,
        name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        image: image,
        category: "pokemon",
        metadata: {
          height: pokemon.height,
          weight: pokemon.weight,
          types: pokemon.types.map((t) => t.type.name),
        },
      };
    } catch (error) {
      this.logger.error("Error fetching Pokemon", error);
      throw new HttpException(
        "Error al obtener Pokémon",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Obtiene un superhéroe aleatorio
   */
  async getRandomSuperhero(): Promise<NormalizedCharacter> {
    try {
      const apiKey = process.env.SUPERHERO_API_KEY;

      if (!apiKey) {
        throw new Error(
          "SUPERHERO_API_KEY no configurado en variables de entorno",
        );
      }

      const randomId = Math.floor(Math.random() * 731) + 1;
      const url = `${this.SUPERHERO_API}/${apiKey}/${randomId}`;

      this.logger.log(`Fetching Superhero: ${url.replace(apiKey, "***")}`);
      const response = await this.axiosInstance.get<SuperheroCharacter>(url);
      const hero = response.data;

      return {
        externalId: `hero-${hero.id}`,
        name: hero.name,
        image: hero.image.url,
        category: "superhero",
        metadata: {
          fullName: hero.biography["full-name"],
          alignment: hero.biography.alignment,
          publisher: hero.biography.publisher,
          gender: hero.appearance.gender,
          race: hero.appearance.race,
          powerstats: hero.powerstats,
        },
      };
    } catch (error) {
      this.logger.error("Error fetching Superhero", error);
      throw new HttpException(
        "Error al obtener superhéroe. Verifica que SUPERHERO_API_KEY esté configurado.",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Busca específicamente a Pikachu
   */
  async getPikachu(): Promise<NormalizedCharacter> {
    try {
      const url = `${this.POKEMON_API}/pokemon/pikachu`;
      this.logger.log(`Fetching Pikachu specifically: ${url}`);

      const response = await this.axiosInstance.get<PokemonCharacter>(url);
      const pikachu = response.data;

      const image =
        pikachu.sprites.other["official-artwork"].front_default ||
        pikachu.sprites.front_default;

      return {
        externalId: `pokemon-25`,
        name: "Pikachu",
        image: image,
        category: "pokemon",
        metadata: {
          height: pikachu.height,
          weight: pikachu.weight,
          types: pikachu.types.map((t) => t.type.name),
        },
      };
    } catch (error) {
      this.logger.error("Error fetching Pikachu", error);
      throw new HttpException(
        "Error al obtener información de Pikachu",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
