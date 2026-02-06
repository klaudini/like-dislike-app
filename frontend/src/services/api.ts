import axios from 'axios';
import type { Character, VoteRequest, Stats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const charactersApi = {
  // Obtener personaje aleatorio
  getRandomCharacter: async (): Promise<Character> => {
    const { data } = await api.get<Character>('/characters/random');
    return data;
  },

  // Votar por un personaje
  vote: async (voteData: VoteRequest): Promise<Character> => {
    const { data } = await api.post<Character>('/characters/vote', voteData);
    return data;
  },

  // Obtener estadísticas generales
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get<Stats>('/characters/stats');
    return data;
  },

  // Obtener personaje más votado
  getMostLiked: async (): Promise<Character> => {
    const { data } = await api.get<Character>('/characters/most-liked');
    return data;
  },

  // Obtener personaje más rechazado
  getMostDisliked: async (): Promise<Character> => {
    const { data } = await api.get<Character>('/characters/most-disliked');
    return data;
  },

  // Obtener último personaje evaluado
  getLastEvaluated: async (): Promise<Character> => {
    const { data} = await api.get<Character>('/characters/last-evaluated');
    return data;
  },
};
