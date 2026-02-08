import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import {
  PokemonCharacter,
  SuperheroCharacter,
  NormalizedCharacter,
} from "../interfaces/external-apis.interface";

@Injectable()
export class ExternalApisService {
  private readonly logger = new Logger(ExternalApisService.name);
  private readonly axiosInstance: AxiosInstance;

  // URLs base de las APIs
  private readonly RICK_MORTY_API = "https://rickandmortyapi.com/api";
  private readonly POKEMON_API = "https://pokeapi.co/api/v2";
  private readonly SUPERHERO_API = "https://superheroapi.com/api";
  private readonly NARUTO_API = "https://api-dattebayo.vercel.app";

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
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

      // Hay 731 superhéroes en la API
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
   * Obtiene un personaje aleatorio de Naruto
   */
  async getRandomNarutoCharacter(): Promise<NormalizedCharacter> {
    try {
      // Hay aproximadamente 1431 personajes en la API
      const randomId = Math.floor(Math.random() * 1431) + 1;
      const url = `${this.NARUTO_API}/characters/${randomId}`;

      this.logger.log(`Fetching Naruto character: ${url}`);
      const response = await this.axiosInstance.get(url);
      const character = response.data;

      // La API puede no tener todos los IDs consecutivos
      if (!character || !character.name) {
        // Si falla, intentar con otro ID recursivamente
        return this.getRandomNarutoCharacter();
      }

      return {
        externalId: `naruto-${character.id}`,
        name: character.name,
        image:
          character.images && character.images.length > 0
            ? character.images[0]
            : "https://via.placeholder.com/300?text=No+Image",
        category: "naruto",
        metadata: {
          debut: character.debut,
          personal: character.personal,
        },
      };
    } catch (error) {
      this.logger.error("Error fetching Naruto character", error);
      // Intentar de nuevo en caso de error (algunos IDs pueden no existir)
      return this.getRandomNarutoCharacter();
    }
  }

  /**
   * Obtiene un personaje aleatorio de cualquier categoría
   */
  async getRandomCharacter(): Promise<NormalizedCharacter> {
    const categories = ["rickandmorty", "pokemon", "superhero", "naruto"];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    this.logger.log(
      `Getting random character from category: ${randomCategory}`,
    );

    switch (randomCategory) {
      case "rickandmorty":
        return this.getRandomRickAndMortyCharacter();
      case "pokemon":
        return this.getRandomPokemon();
      case "superhero":
        return this.getRandomSuperhero();
      case "naruto":
        return this.getRandomNarutoCharacter();
      default:
        throw new HttpException(
          "Categoría inválida",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  /**
   * Busca específicamente a Pikachu (para el endpoint bonus)
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
