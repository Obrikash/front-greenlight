import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getFavoriteMovies, Movie, API_BASE_URL } from '../api/client';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, userLoading, getProfile } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch favorite movies
  const { 
    data: favoritesData, 
    isLoading: isFavoritesLoading, 
    error: favoritesError 
  } = useQuery({
    queryKey: ['favoriteMovies'],
    queryFn: getFavoriteMovies,
    enabled: !!user, // Only fetch if user is logged in
  });

  useEffect(() => {
    document.title = 'Профиль пользователя';
    
    // If we don't have user data yet, try to fetch it
    if (!user && !userLoading) {
      setLoading(true);
      getProfile()
        .catch(err => {
          console.error('Error loading profile:', err);
          setError('Не удалось загрузить данные профиля. Пожалуйста, попробуйте снова позже.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, userLoading, getProfile]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Helper to deduplicate movies based on ID
  const getUniqueMovies = (movies: Movie[]): Movie[] => {
    const uniqueMoviesMap = new Map();
    movies.forEach(movie => {
      if (!uniqueMoviesMap.has(movie.id)) {
        uniqueMoviesMap.set(movie.id, movie);
      }
    });
    return Array.from(uniqueMoviesMap.values());
  };

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Загрузка данных профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Информация о пользователе недоступна</p>
      </div>
    );
  }

  // Get unique movies to avoid duplicates
  const uniqueFavoriteMovies = favoritesData?.movies ? getUniqueMovies(favoritesData.movies) : [];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль пользователя</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Личная информация</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">Имя:</div>
                <div className="font-medium">{user.name}</div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">Email:</div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">ID:</div>
                <div className="font-medium">{user.id}</div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">Создан:</div>
                <div className="font-medium">{formatDate(user.created_at)}</div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm text-gray-600">Статус:</div>
                <div className="font-medium">
                  {user.activated ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Активирован
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Не активирован
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Favorite Movies Section */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Избранные фильмы
              {favoritesData?.metadata && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (всего: {favoritesData.metadata.total_records})
                </span>
              )}
            </h2>
            
            {isFavoritesLoading && (
              <div className="py-8 text-center">
                <p className="text-gray-500">Загрузка избранных фильмов...</p>
              </div>
            )}
            
            {favoritesError && (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">
                  Не удалось загрузить избранные фильмы.
                </p>
              </div>
            )}
            
            {!isFavoritesLoading && !favoritesError && uniqueFavoriteMovies.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">В избранном пока нет фильмов.</p>
                <Link 
                  to="/" 
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
                >
                  Посмотреть каталог фильмов
                </Link>
              </div>
            )}
            
            {uniqueFavoriteMovies.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueFavoriteMovies.map(movie => (
                  <Link 
                    key={movie.id} 
                    to={`/movies/${movie.id}`} 
                    className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[2/3] bg-gray-200">
                      {movie.image ? (
                        <img 
                          src={`${API_BASE_URL}/assets/${movie.image}`} 
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=Нет+изображения';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Нет изображения
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate">{movie.title}</h3>
                      <p className="text-sm text-gray-500">{movie.year}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {movie.genres.slice(0, 2).map(genre => (
                          <span 
                            key={`${movie.id}-${genre}`} 
                            className="inline-block px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                        {movie.genres.length > 2 && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded">
                            +{movie.genres.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 