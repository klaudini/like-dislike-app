import { motion } from 'framer-motion';
import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onLike: () => void;
  onDislike: () => void;
  isLoading?: boolean;
}

export const CharacterCard = ({ character, onLike, onDislike, isLoading }: CharacterCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="card max-w-md w-full"
    >
      {/* Imagen */}
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Nombre y Categoría */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {character.name}
        </h2>
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          {character.category.replace('rickandmorty', 'Rick & Morty')}
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={onDislike}
          disabled={isLoading}
          className="flex-1 btn-dislike disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dislike
        </button>
        <button
          onClick={onLike}
          disabled={isLoading}
          className="flex-1 btn-like disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Like
        </button>
      </div>
    </motion.div>
  );
};
