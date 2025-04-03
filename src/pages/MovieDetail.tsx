import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Movie, API_BASE_URL, addMovieToFavorites, removeMovieFromFavorites } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface MovieDetailResponse {
  movie: Movie;
  is_favourite: boolean;
}

type FavoriteAction = 'add' | 'remove' | null;

export const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lastAction, setLastAction] = useState<FavoriteAction>(null);

  const { data, isLoading, error } = useQuery<MovieDetailResponse>({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await apiClient.get(`/movies/${id}`);
      console.log('Movie API response:', response.data);
      return response.data;
    },
  });

  useEffect(() => {
    if (data) {
      console.log('Movie data received:', data.movie);
      console.log('Is favourite status (from response):', data.is_favourite);
    }
  }, [data]);

  const handleBack = () => {
    navigate('/');
  };

  const handleFavoriteAction = async () => {
    if (!id || isProcessing || !data) return;
    
    const isFavorite = data.is_favourite === true;
    
    console.log('Current favorite status:', isFavorite);
    
    try {
      setIsProcessing(true);
      setActionError('');
      setActionSuccess(false);
      
      let response;
      if (isFavorite) {
        // Remove from favorites
        console.log('Attempting to remove from favorites');
        response = await removeMovieFromFavorites(parseInt(id));
        console.log('Removed from favorites:', response);
        setLastAction('remove');
      } else {
        // Add to favorites
        console.log('Attempting to add to favorites');
        response = await addMovieToFavorites(parseInt(id));
        console.log('Added to favorites:', response);
        setLastAction('add');
      }
      
      setActionSuccess(true);
      
      // Update the cached movie data to reflect the new favorite status
      queryClient.setQueryData<MovieDetailResponse>(['movie', id], (oldData) => {
        if (!oldData) return undefined;
        return {
          ...oldData,
          is_favourite: !isFavorite
        };
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error managing favorites:', err);
      setActionError(isFavorite 
        ? 'Не удалось удалить фильм из избранного' 
        : 'Не удалось добавить фильм в избранное');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Ошибка загрузки информации о фильме</div>
      </div>
    );
  }

  if (!data || !data.movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Фильм не найден</div>
      </div>
    );
  }

  const movie = data.movie;
  
  // Ensure we're correctly checking the is_favourite status from the response
  const isFavorite = data.is_favourite === true;
  console.log('Rendering with favorite status:', isFavorite, 'Raw value:', data.is_favourite);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-600"
          >
            &larr; Назад к фильмам
          </button>

          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="flex flex-col md:flex-row">
              {movie.image && (
                <div className="md:w-1/3">
                  <img
                    src={`${API_BASE_URL}/assets/${movie.image}`}
                    alt={movie.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Нет+Изображения';
                    }}
                  />
                </div>
              )}
              <div className="p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
                  
                  <button
                    onClick={handleFavoriteAction}
                    disabled={isProcessing}
                    className={`ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md 
                      ${actionSuccess 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : isFavorite 
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-pink-600 hover:bg-pink-700 text-white'
                      } transition-colors duration-300 disabled:opacity-50`}
                  >
                    {isProcessing 
                      ? (isFavorite ? 'Удаление...' : 'Добавление...') 
                      : actionSuccess 
                        ? (lastAction === 'add' ? '✓ Добавлено в избранное' : '✓ Удалено из избранного') 
                        : (isFavorite ? 'Удалить из избранного' : 'В избранное')}
                  </button>
                </div>
                
                {actionError && (
                  <div className="mt-2 text-sm text-red-600">
                    {actionError}
                  </div>
                )}
                
                {isFavorite && !actionSuccess && !actionError && (
                  <div className="mt-2 text-sm text-green-600">
                    ★ Этот фильм в вашем избранном
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mb-4">
                  {movie.year} • {movie.runtime} • {movie.genres.join(', ')}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Год</dt>
                      <dd className="mt-1 text-sm text-gray-900">{movie.year}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Продолжительность</dt>
                      <dd className="mt-1 text-sm text-gray-900">{movie.runtime}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Жанры</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-2">
                          {movie.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-md"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 