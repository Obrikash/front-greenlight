import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface MovieFormProps {
  onSuccess: () => void;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSuccess }) => {
  console.log('Rendering MovieForm component');
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    runtime: '',
    genres: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('MovieForm component mounted');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting movie:', formData);
    setIsSubmitting(true);
    setError('');

    try {
      // Convert year to number and genres to array
      const movieData = {
        ...formData,
        year: Number(formData.year),
        genres: formData.genres.split(',').map(genre => genre.trim())
      };

      console.log('Formatted movie data:', movieData);
      const response = await apiClient.post('/movies', movieData);
      console.log('Movie created:', response.data);
      
      setFormData({
        title: '',
        year: new Date().getFullYear(),
        runtime: '',
        genres: '',
        image: ''
      });
      onSuccess();
    } catch (err: any) {
      console.error('Movie creation error:', err);
      setError(err.response?.data?.error || 'Не удалось создать фильм');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Добавить новый фильм</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название
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
              Год
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
              Продолжительность (напр. "107 мин")
            </label>
            <input
              type="text"
              id="runtime"
              name="runtime"
              value={formData.runtime}
              onChange={handleChange}
              required
              placeholder="107 мин"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-gray-700 mb-1">
              Жанры (через запятую)
            </label>
            <input
              type="text"
              id="genres"
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              required
              placeholder="Анимация, Приключения, Комедия"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              URL изображения
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="постер-фильма.jpg"
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
            {isSubmitting ? 'Создание...' : 'Создать фильм'}
          </button>
        </div>
      </form>
    </div>
  );
}; 