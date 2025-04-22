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
    <div className='bg-blue-50 h-screen flex items-center'>
      {toast && (
        <Toast
          message={Object.values(toast)[0]}
          type={Object.keys(toast)[0]}
          onClose={closeToast}
          duration={3000}
        />
      )}
      <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
        {toast && Object.keys(toast)[0] === 'success' ? <Spinner /> : ''}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type='text'
          name='username'
          placeholder='username'
          className='block w-full rounded-sm p-2 mt-2 mb-2 border'
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type='password'
          name='password'
          placeholder='password'
          className='block w-full rounded-sm p-2 mb-2 border'
          required
        />
        <button
          className='bg-blue-500 text-white block w-full rounded-sm p-2'
          type='submit'
        >
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        {isLoginOrRegister === 'register' && (
          <div className='text-center mt-2'>
            Already a member?{' '}
            <button
              className='underline'
              onClick={() => setIsLoginOrRegister('login')}
              type='button'
            >
              Login here
            </button>
          </div>
        )}
        {isLoginOrRegister === 'login' && (
          <div className='text-center mt-2'>
            Don't have an account?{' '}
            <button
              className='underline'
              onClick={() => setIsLoginOrRegister('register')}
              type='button'
            >
              Register
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default EntryForm;
