import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { charactersApi } from './services/api';
import { CharacterCard } from './components/CharacterCard';
import { StatsDisplay } from './components/StatsDisplay';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import type { Character, VoteRequest } from './types';

function App() {
  const queryClient = useQueryClient();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);

  // Obtener personaje aleatorio
  const {
    data: randomCharacter,
    isLoading: isLoadingCharacter,
    error: characterError,
    refetch: refetchCharacter,
  } = useQuery({
    queryKey: ['randomCharacter'],
    queryFn: charactersApi.getRandomCharacter,
    enabled: !currentCharacter,
  });

  // Obtener estadísticas
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: charactersApi.getStats,
    refetchInterval: 10000,
  });

  // Mutation para votar
  const voteMutation = useMutation({
    mutationFn: (voteData: VoteRequest) => charactersApi.vote(voteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setCurrentCharacter(null);
      refetchCharacter();
    },
  });

  if (randomCharacter && !currentCharacter) {
    setCurrentCharacter(randomCharacter);
  }

  const handleVote = (voteType: 'like' | 'dislike') => {
    if (!currentCharacter) return;

    const voteData: VoteRequest = {
      externalId: currentCharacter.externalId,
      voteType,
      name: currentCharacter.name,
      image: currentCharacter.image,
      category: currentCharacter.category,
      metadata: currentCharacter.metadata,
    };

    voteMutation.mutate(voteData);
  };

  const handleLike = () => handleVote('like');
  const handleDislike = () => handleVote('dislike');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Te Gusta el Personaje?
        </h1>
        <p className="text-gray-600">Vota por tu personaje favorito</p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row gap-8 items-start w-full max-w-5xl">
        {/* Character Card */}
        <div className="flex-1 flex justify-center w-full">
          <AnimatePresence mode="wait">
            {characterError ? (
              <ErrorMessage
                message="Failed to load character"
                onRetry={() => refetchCharacter()}
              />
            ) : isLoadingCharacter || voteMutation.isPending || !currentCharacter ? (
              <div className="card max-w-md w-full flex items-center justify-center min-h-[500px]">
                <Loading />
              </div>
            ) : (
              <CharacterCard
                key={currentCharacter.externalId}
                character={currentCharacter}
                onLike={handleLike}
                onDislike={handleDislike}
                isLoading={voteMutation.isPending}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Stats Display */}
        <div className="flex-1 flex justify-center w-full">
          <StatsDisplay stats={stats ?? null} isLoading={isLoadingStats} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm">
        <p>Rick and Morty • Pokemon • Superhero</p>
      </footer>
    </div>
  );
}

export default App;
