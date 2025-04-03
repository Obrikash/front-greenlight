import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Movie, API_BASE_URL, getMovies, MovieQueryParams } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { MovieForm } from '../components/MovieForm';

interface MoviesProps {
  showForm?: boolean;
}

// Sorting options
const sortOptions = [
  { value: 'title', label: 'По названию (А-Я)' },
  { value: '-title', label: 'По названию (Я-А)' },
  { value: 'year', label: 'По году (старые сначала)' },
  { value: '-year', label: 'По году (новые сначала)' },
  { value: 'runtime', label: 'По длительности (короткие сначала)' },
  { value: '-runtime', label: 'По длительности (длинные сначала)' }
];

export const Movies: React.FC<MoviesProps> = ({ showForm = false }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get search parameters from URL
  const initialTitle = searchParams.get('title') || '';
  const initialSort = searchParams.get('sort') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  // State for search and filter inputs
  const [searchTitle, setSearchTitle] = useState(initialTitle);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isSearching, setIsSearching] = useState(false);
  
  // Build query parameters based on state
  const queryParams: MovieQueryParams = {
    page: currentPage
  };
  
  if (searchTitle) {
    queryParams.title = searchTitle;
  }
  
  if (sortBy) {
    queryParams.sort = sortBy;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', queryParams],
    queryFn: async () => {
      console.log('Fetching movies with params:', queryParams);
      return getMovies(queryParams);
    },
  });

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTitle) {
      params.set('title', searchTitle);
    }
    
    if (sortBy) {
      params.set('sort', sortBy);
    }
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    setSearchParams(params);
  }, [searchTitle, sortBy, currentPage, setSearchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(false);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleMovieAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['movies'] });
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.metadata?.last_page || 1;

  if (isLoading) {
    return <div className="text-xl text-center py-10">Загрузка фильмов...</div>;
  }

  if (error) {
    return <div className="text-xl text-center text-red-600 py-10">Ошибка загрузки фильмов</div>;
  }

  return (
    <>
      {showForm && <MovieForm onSuccess={handleMovieAdded} />}
      
      {/* Search and filter bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search-title" className="sr-only">Поиск по названию</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search-title"
                type="text"
                placeholder="Поиск фильма..."
                value={isSearching ? searchTitle : initialTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value);
                  setIsSearching(true);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="md:w-64">
            <label htmlFor="sort-by" className="sr-only">Сортировка</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1); // Reset to first page on sort change
              }}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Сортировка (по умолчанию)</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Поиск
          </button>
        </form>
      </div>
      
      {/* Results count */}
      {data?.metadata && (
        <div className="mb-4 text-sm text-gray-600">
          {data.metadata.total_records === 0
            ? 'Фильмов не найдено'
            : `Найдено ${data.metadata.total_records} фильм(ов)`
          }
          {searchTitle && ` по запросу "${searchTitle}"`}
        </div>
      )}
      
      {/* Movies grid */}
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
            <p className="text-gray-500">
              {searchTitle 
                ? `Фильмы не найдены по запросу "${searchTitle}". Попробуйте изменить параметры поиска.` 
                : 'Фильмы не найдены. Добавьте свой первый фильм!'}
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {data?.metadata && data.metadata.last_page > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Навигация">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Предыдущая</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                // Show current page, first and last page, and pages around current page
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => {
                // Add ellipsis when there are gaps in the sequence
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        currentPage === page
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                    
                    {showEllipsisAfter && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Следующая</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}; 