import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export const AccountActivation: React.FC = () => {
  console.log('Rendering AccountActivation component');
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    console.log('AccountActivation component mounted');
    document.title = 'Активация Аккаунта';
  }, []);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting token:', token);
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.put('/users/activated', { token });
      setSuccess(true);
      // Wait 3 seconds before redirecting to sign in page
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      console.error('Account activation error:', err);
      
      // More robust error handling
      let errorMessage = 'Не удалось активировать аккаунт. Пожалуйста, попробуйте снова.';
      
      if (err.response) {
        console.log('Error response data:', err.response.data);
        
        // Check for different error formats
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data.error === 'object') {
          // Handle nested error objects like { error: { token: "must be 26 bytes long" } }
          const errorObj = err.response.data.error;
          if (errorObj.token) {
            errorMessage = `Ошибка токена: ${errorObj.token}`;
          } else {
            // Join all error messages if there are multiple
            errorMessage = Object.values(errorObj).join(', ');
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Активация Аккаунта
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Пожалуйста, введите токен активации, который вы получили по электронной почте
        </p>
      </div>

      {success ? (
        <div className="mt-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Аккаунт успешно активирован!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Вы будете перенаправлены на страницу входа через несколько секунд.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div>
            <label htmlFor="token" className="sr-only">
              Токен активации
            </label>
            <input
              id="token"
              name="token"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Введите ваш токен активации"
              value={token}
              onChange={handleTokenChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Активация...' : 'Активировать аккаунт'}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <Link to="/signin" className="text-indigo-600 hover:text-indigo-500">
          Уже активировали аккаунт? Войти
        </Link>
      </div>
    </div>
  );
}; 