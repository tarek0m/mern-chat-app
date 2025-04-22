import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContextValue';
import Toast from '../components/Toast/Toast';
import Spinner from '../components/Spinner/Spinner';
import { useNavigate } from 'react-router-dom';

function EntryForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
  const {
    shouldNavigate,
    setShouldNavigate,
    setUsername: setLoggedInUsername,
    setId,
  } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldNavigate) {
      navigate('/chat');
    }
  }, [shouldNavigate, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const url = isLoginOrRegister === 'register' ? '/register' : '/login';
    try {
      const response = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(response.data.id);

      if (response.data.success) {
        setToast({ success: response.data.success });
        setTimeout(() => {
          setShouldNavigate(true);
        }, 1000);
      }
    } catch (error) {
      // Handle error responses
      const errorMessage = error.response?.data?.error || 'An error occurred';
      setToast({ error: errorMessage });
      console.error('Form submission error:', error);
    }
  }

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
      {toast && (
        <Toast
          message={Object.values(toast)[0]}
          type={Object.keys(toast)[0]}
          onClose={closeToast}
          duration={3000}
        />
      )}

      <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center shadow-md'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='white'
                className='w-10 h-10'
              >
                <path d='M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z' />
                <path d='M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z' />
              </svg>
            </div>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-1'>MERN Chat</h2>
          <p className='text-gray-600'>
            {isLoginOrRegister === 'register'
              ? 'Create a new account'
              : 'Sign in to your account'}
          </p>
        </div>

        {toast && Object.keys(toast)[0] === 'success' ? (
          <div className='flex justify-center my-4'>
            <Spinner />
          </div>
        ) : (
          ''
        )}

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Username
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <input
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type='text'
                name='username'
                placeholder='Enter your username'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Password
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <input
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type='password'
                name='password'
                placeholder='Enter your password'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                required
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
              {isLoginOrRegister === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className='mt-6 pt-4 border-t border-gray-200'>
          {isLoginOrRegister === 'register' ? (
            <div className='text-center text-sm'>
              Already have an account?{' '}
              <button
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200'
                onClick={() => setIsLoginOrRegister('login')}
                type='button'
              >
                Sign in
              </button>
            </div>
          ) : (
            <div className='text-center text-sm'>
              Don't have an account?{' '}
              <button
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200'
                onClick={() => setIsLoginOrRegister('register')}
                type='button'
              >
                Create one
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EntryForm;
