import { motion } from 'framer-motion';
import type { Stats } from '../types';

interface StatsDisplayProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export const StatsDisplay = ({ stats, isLoading }: StatsDisplayProps) => {
  if (isLoading) {
    return (
      <div className="card max-w-md w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-md w-full"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        Estadísticas
      </h3>

      <div className="space-y-3">
        {/* Most Liked */}
        {stats.mostLiked && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">El que mas gusta</p>
              <p className="font-medium text-gray-900">{stats.mostLiked.name}</p>
            </div>
            <span className="text-green-600 font-semibold">{stats.mostLiked.likes}</span>
          </div>
        )}

        {/* Most Disliked */}
        {stats.mostDisliked && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">El que menos gusta</p>
              <p className="font-medium text-gray-900">{stats.mostDisliked.name}</p>
            </div>
            <span className="text-red-600 font-semibold">{stats.mostDisliked.dislikes}</span>
          </div>
        )}

        {/* Last Evaluated */}
        {stats.lastEvaluated && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Último votado</p>
              <p className="font-medium text-gray-900">{stats.lastEvaluated.name}</p>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4 pt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalCharacters}</p>
            <p className="text-sm text-gray-500">Characters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
            <p className="text-sm text-gray-500">Total de Votos</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
