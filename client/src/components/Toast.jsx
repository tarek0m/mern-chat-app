import { useEffect } from 'react';

const Toast = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Define type-based styling
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div
      className={`fixed top-5 right-5 min-w-[200px] p-4 rounded flex items-center justify-between gap-3 z-[1001] shadow-lg animate-slideIn ${typeStyles[type]}`}
      role='alert'
      data-testid='toast-message'
    >
      <div className='flex-grow text-sm leading-6'>{message}</div>
      <button
        className='bg-transparent border-none text-inherit text-xl cursor-pointer p-0 opacity-80 transition-opacity hover:opacity-100'
        onClick={onClose}
        aria-label='Close notification'
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
