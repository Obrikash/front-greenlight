import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Movie, API_BASE_URL } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { MovieForm } from '../components/MovieForm';

export const Movies: React.FC = () => {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await apiClient.get('/movies');
      return response.data;
    },
  });

  const handleMovieAdded = () => {
    // Refresh the movie list
    queryClient.invalidateQueries({ queryKey: ['movies'] });
    // Hide the form after successful creation
    setShowForm(false);
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
        <div className="text-xl text-red-600">Error loading movies</div>
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
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 mr-2"
              >
                {showForm ? 'Hide Form' : 'Add Movie'}
              </button>
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
          {showForm && (
            <MovieForm onSuccess={handleMovieAdded} />
          )}
          
          <h2 className="text-xl font-semibold mb-4">Movies</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.movies && data.movies.length > 0 ? (
              data.movies.map((movie: Movie) => (
                <div
                  key={movie.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  {movie.image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={`${API_BASE_URL}/assets/${movie.image}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          {movie.title}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">
                        <p>Year: {movie.year}</p>
                        <p>Runtime: {movie.runtime}</p>
                        <p>Genres: {movie.genres.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No movies found. Add your first movie!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 