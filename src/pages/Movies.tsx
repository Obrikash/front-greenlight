import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Movie, API_BASE_URL } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { MovieForm } from '../components/MovieForm';

interface MoviesProps {
  showForm?: boolean;
}

export const Movies: React.FC<MoviesProps> = ({ showForm = false }) => {
  console.log('Rendering Movies component, showForm:', showForm);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Movies component mounted');
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      console.log('Fetching movies');
      try {
        const response = await apiClient.get('/movies');
        console.log('Movies fetch response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching movies:', err);
        throw err;
      }
    },
  });

  const handleMovieAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['movies'] });
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  if (isLoading) {
    return <div className="text-xl text-center py-10">Загрузка фильмов...</div>;
  }

  if (error) {
    return <div className="text-xl text-center text-red-600 py-10">Ошибка загрузки фильмов</div>;
  }

  return (
    <>
      {showForm && <MovieForm onSuccess={handleMovieAdded} />}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {data?.movies && data.movies.length > 0 ? (
          data.movies.map((movie: Movie) => (
            <div
              key={movie.id}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleMovieClick(movie.id)}
            >
              {movie.image && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={`${API_BASE_URL}/assets/${movie.image}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Нет+Изображения';
                    }}
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{movie.title}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Год: {movie.year}</p>
                  <p>Продолжительность: {movie.runtime}</p>
                  <p>Жанры: {movie.genres.join(', ')}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Фильмы не найдены. Добавьте свой первый фильм!</p>
          </div>
        )}
      </div>
    </>
  );
}; 