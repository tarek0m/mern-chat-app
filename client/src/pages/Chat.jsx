import React, { useEffect, useContext, useRef, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContextValue';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import MessageList from '../components/MessageList/MessageList';

function Chat() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { username, setUsername, id, setId } = useContext(UserContext);
  const { setShouldNavigate } = useContext(UserContext);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket connection and event listeners
  useEffect(() => {
    if (username) {
      socketRef.current = io('http://localhost:8000', {
        withCredentials: true,
      });
      console.log(socketRef);
      socketRef.current.on('connect', () => {
        console.log('Connected to socket server, id:', socketRef.current.id);
      });
      socketRef.current.on('onlineUsers', (users) => {
        const filteredUsers = users.filter(
          (u) => u.userId && u.username && u.userId !== id
        );
        setOnlineUsers(filteredUsers);
      });

      // Listen for new messages
      socketRef.current.on('newMessage', (message) => {
        setMessages((prev) => [
          ...prev,
          {
            id: message._id,
            content: message.content,
            sender: {
              id: message.sender._id,
              username: message.sender.username,
            },
            recipient: {
              id: message.recipient._id,
              username: message.recipient.username,
            },
            timestamp: message.createdAt,
          },
        ]);
      });

      // Listen for message errors
      socketRef.current.on('messageError', (error) => {
        console.error('Message error:', error);
        // Could add toast notification here
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('onlineUsers');
        socketRef.current.off('newMessage');
        socketRef.current.off('messageError');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [username, id]); // Add id dependency

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!username) {
      setShouldNavigate(false);
      navigate('/');
    }
  }, [username, setShouldNavigate, navigate]);

  function handleLoggingOut() {
    axios
      .post('/logout')
      .then(() => {
        setUsername(null);
        setId(null);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      })
      .catch((err) => {
        console.error('Logout error:', err);
        setUsername(null);
        setId(null);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      });
  }
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      setMessages([]);

      axios
        .get(`/messages/${selectedUser}`)
        .then((response) => {
          setMessages(
            response.data.map((msg) => ({
              id: msg._id,
              content: msg.content,
              sender: {
                id: msg.sender._id,
                username: msg.sender.username,
              },
              recipient: {
                id: msg.recipient._id,
                username: msg.recipient.username,
              },
              timestamp: msg.createdAt,
            }))
          );
        })
        .catch((err) => {
          console.error('Error fetching messages:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || !selectedUser) return;

    // Send message via socket
    socketRef.current.emit('sendMessage', {
      recipientId: selectedUser,
      content: message,
    });

    setMessage('');
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='bg-white w-1/4 flex flex-col shadow-lg'>
        {/* App Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold flex items-center gap-3 p-4 shadow-md'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-7 h-7'
          >
            <path d='M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z' />
            <path d='M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z' />
          </svg>
          <span className='text-xl'>MERN Chat</span>
        </div>

        {/* Search Bar */}
        <div className='p-3 border-b border-gray-100'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search users...'
              className='w-full bg-gray-50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400 absolute left-3 top-2.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        {/* Online Users List */}
        <div className='flex-grow overflow-y-auto'>
          <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-2'>
            Online Users
          </h3>
          {onlineUsers.length === 0 ? (
            <div className='text-sm text-gray-500 px-4 py-2'>
              No users online
            </div>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.userId}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedUser === user.userId
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : ''
                }`}
                onClick={() => setSelectedUser(user.userId)}
              >
                <div className='relative'>
                  <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg'>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
                </div>
                <div>
                  <div className='font-medium'>{user.username}</div>
                  <div className='text-xs text-gray-500'>Online</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Profile Section */}
        <div className='p-3 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold'>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className='font-medium'>{username}</div>
                <div className='text-xs text-gray-500'>Active now</div>
              </div>
            </div>
            <button
              onClick={handleLoggingOut}
              className='text-sm bg-gray-200 hover:bg-gray-300 py-2 px-3 text-gray-700 rounded-md transition-colors duration-200 flex items-center gap-1'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex flex-col bg-white w-3/4 border-l border-gray-200'>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className='border-b border-gray-200 p-4 flex items-center justify-between shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg'>
                  {onlineUsers
                    .find((u) => u.userId === selectedUser)
                    ?.username.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className='font-medium'>
                    {
                      onlineUsers.find((u) => u.userId === selectedUser)
                        ?.username
                    }
                  </div>
                  <div className='text-xs text-green-500 flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                    Online
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <button className='p-2 text-gray-500 hover:bg-gray-100 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </button>
                <button className='p-2 text-gray-500 hover:bg-gray-100 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                    />
                  </svg>
                </button>
                <button className='p-2 text-gray-500 hover:bg-gray-100 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-grow p-4 overflow-y-auto bg-gray-50'>
              <div className='text-center p-4 mb-4 bg-white rounded-lg shadow-sm'>
                <p className='text-gray-500'>
                  This is the beginning of your conversation with{' '}
                  {onlineUsers.find((u) => u.userId === selectedUser)?.username}
                </p>
              </div>

              {loading ? (
                <div className='flex justify-center items-center h-full'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                </div>
              ) : (
                <MessageList messages={messages} currentUserId={id} />
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className='flex-grow flex flex-col items-center justify-center bg-gray-50'>
            <div className='text-center p-8 max-w-md'>
              <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-10 w-10 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                Welcome to MERN Chat
              </h3>
              <p className='text-gray-600 mb-6'>
                Select a user from the sidebar to start a conversation
              </p>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className='border-t border-gray-200 p-4 bg-white'
        >
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='p-2 text-gray-500 hover:text-blue-500 transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                />
              </svg>
            </button>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type your message here'
              className='flex-grow py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
              disabled={!selectedUser}
            />
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 p-2 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!selectedUser || message.trim() === ''}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
