import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, Movie, API_BASE_URL } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await apiClient.get(`/movies/${id}`);
      return response.data;
    },
  });

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading movie details</div>
      </div>
    );
  }

  const movie: Movie = data?.movie;

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Movie Collection</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={signOut}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-600"
          >
            &larr; Back to Movies
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
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Image';
                    }}
                  />
                </div>
              )}
              <div className="p-6 md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
                <div className="text-sm text-gray-500 mb-4">
                  {movie.year} • {movie.runtime} • {movie.genres.join(', ')}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Year</dt>
                      <dd className="mt-1 text-sm text-gray-900">{movie.year}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Runtime</dt>
                      <dd className="mt-1 text-sm text-gray-900">{movie.runtime}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Genres</dt>
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