// Interface API Rick and Morty
export interface RickAndMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
}

export interface RickAndMortyResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyCharacter[];
}

// Interface API de Pokemon
export interface PokemonCharacter {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  species: {
    name: string;
  };
}

export interface PokemonListResponse {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
}

// Interface API Superhero
export interface SuperheroCharacter {
  id: string;
  name: string;
  powerstats: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
  biography: {
    "full-name": string;
    alignment: string;
    publisher: string;
  };
  appearance: {
    gender: string;
    race: string;
  };
  image: {
    url: string;
  };
}

export interface NarutoCharacter {
  id: number;
  name: string;
  images: string[];
  debut?: any;
  personal?: any;
}

export interface SuperheroSearchResponse {
  response: string;
  results: SuperheroCharacter[];
}

// Interface unificada para respuesta normalizada
export interface NormalizedCharacter {
  externalId: string;
  name: string;
  image: string;
  category: "rickandmorty" | "pokemon" | "superhero" | "naruto";
  metadata: Record<string, any>;
}
