import React from 'react';

const Message = ({ content, sender, timestamp, isOwnMessage }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isOwnMessage && (
        <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-2'>
          {sender.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && (
          <div className='font-medium text-xs mb-1'>{sender}</div>
        )}
        <div className='break-words'>{content}</div>
        <div
          className={`text-xs mt-1 text-right ${
            isOwnMessage ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;
