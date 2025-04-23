import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContextValue';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';
import { BiMessageDetail } from 'react-icons/bi';
import { FaUser, FaLock } from 'react-icons/fa';

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
        }, 1500);
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
              <BiMessageDetail className='w-10 h-10 text-white' />
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
                <FaUser className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='username'
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLocaleLowerCase())
                }
                type='text'
                name='username'
                placeholder='Enter your username (only lower case allowed)'
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
                <FaLock className='h-5 w-5 text-gray-400' />
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
