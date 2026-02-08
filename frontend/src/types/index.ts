export interface Character {
  externalId: string;
  name: string;
  image: string;
  category: 'rickandmorty' | 'pokemon' | 'superhero' | 'naruto';
  likes?: number;
  dislikes?: number;
  totalVotes?: number;
  likePercentage?: number;
  lastEvaluated?: Date;
  metadata?: Record<string, any>;
}

export interface VoteRequest {
  externalId: string;
  voteType: 'like' | 'dislike';
  name: string;
  image: string;
  category: 'rickandmorty' | 'pokemon' | 'superhero' | 'naruto';
  metadata?: Record<string, any>;
}

export interface Stats {
  mostLiked: Character | null;
  mostDisliked: Character | null;
  lastEvaluated: Character | null;
  totalCharacters: number;
  totalVotes: number;
}
