import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user, userLoading, getProfile } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль пользователя</h1>
      
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <div className="w-24 text-gray-600">Имя:</div>
            <div className="font-medium">{user.name}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-24 text-gray-600">Email:</div>
            <div className="font-medium">{user.email}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-24 text-gray-600">ID:</div>
            <div className="font-medium">{user.id}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-24 text-gray-600">Создан:</div>
            <div className="font-medium">{formatDate(user.created_at)}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-24 text-gray-600">Статус:</div>
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
  );
}; 