import React from 'react';

function UserCard({ user, selectedUser, setSelectedUser, typingUserIds }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        selectedUser?.userId === user.userId
          ? 'bg-blue-50 border-l-4 border-blue-500'
          : ''
      }`}
      onClick={() =>
        setSelectedUser({
          userId: user.userId,
          username: user.username,
        })
      }
    >
      <div className='relative'>
        <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg'>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
      </div>
      <div>
        <div className='font-medium'>{user.username}</div>
        <div className='text-xs text-gray-500'>
          {typingUserIds.includes(user.userId) ? 'typing...' : 'Online'}
        </div>
      </div>
    </div>
  );
}

export default UserCard;
