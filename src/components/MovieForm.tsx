import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface MovieFormProps {
  onSuccess: () => void;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    runtime: '',
    genres: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert year to number and genres to array
      const movieData = {
        ...formData,
        year: Number(formData.year),
        genres: formData.genres.split(',').map(genre => genre.trim())
      };

      await apiClient.post('/movies', movieData);
      setFormData({
        title: '',
        year: new Date().getFullYear(),
        runtime: '',
        genres: '',
        image: ''
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Add New Movie</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="runtime" className="block text-sm font-medium text-gray-700 mb-1">
              Runtime (e.g. "107 mins")
            </label>
            <input
              type="text"
              id="runtime"
              name="runtime"
              value={formData.runtime}
              onChange={handleChange}
              required
              placeholder="107 mins"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-gray-700 mb-1">
              Genres (comma separated)
            </label>
            <input
              type="text"
              id="genres"
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              required
              placeholder="Animation, Adventure, Comedy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="movie-poster.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Movie'}
          </button>
        </div>
      </form>
    </div>
  );
}; 