import React from 'react';
import Message from '../Message/Message';

const MessageList = ({ messages, currentUserId }) => {
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateStr = date.toLocaleDateString();

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }

      groups[dateStr].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Check if today
  const isToday = (dateStr) => {
    const today = new Date().toLocaleDateString();
    return dateStr === today;
  };

  // Check if yesterday
  const isYesterday = (dateStr) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toLocaleDateString();
  };

  // Format date label
  const formatDateLabel = (dateStr) => {
    if (isToday(dateStr)) return 'Today';
    if (isYesterday(dateStr)) return 'Yesterday';
    return dateStr;
  };

  return (
    <div className='flex flex-col space-y-4 p-4'>
      {Object.keys(messageGroups).map((dateStr) => (
        <div key={dateStr}>
          <div className='flex justify-center mb-4'>
            <div className='bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full'>
              {formatDateLabel(dateStr)}
            </div>
          </div>

          {messageGroups[dateStr].map((message) => (
            <Message
              key={message.id}
              content={message.content}
              sender={message.sender.username}
              timestamp={message.timestamp}
              isOwnMessage={message.sender.id === currentUserId}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
