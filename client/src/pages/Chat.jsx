import React, { useEffect, useContext, useRef, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContextValue';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import MessageList from '../components/MessageList';
import UserCard from '../components/UserCard';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import { BiMessageDetail } from 'react-icons/bi';
import { IoSearchOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiPhone, HiVideoCamera } from 'react-icons/hi';
import { FiPaperclip } from 'react-icons/fi';
import { IoMdSend } from 'react-icons/io';
import { RiLogoutBoxLine } from 'react-icons/ri';

function Chat() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
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
      socketRef.current = io('http://127.0.0.1:8000', {
        withCredentials: true,
      });
      socketRef.current.on('onlineUsers', (users) => {
        const filteredUsers = users.filter(
          (u) => u.userId && u.username && u.userId !== id
        );
        setOnlineUsers(filteredUsers);
        if (!filteredUsers.length) {
          setSelectedUser(null);
          setDropdownVisible(false);
        }
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

        // If this is a message we sent (confirmation of delivery)
        // if (message.sender._id === id) {
        //   setToast({ success: 'Message delivered successfully' });
        // }
      });

      // Listen for typing event
      socketRef.current.on('typingEvent', (typingUserID) => {
        if (!typingUserIds.includes(typingUserID)) {
          setTypingUserIds([...typingUserIds, typingUserID]);
        }
      });

      // Listen for typing ending event
      socketRef.current.on('typingEndedEvent', (typingUserID) => {
        setTypingUserIds(typingUserIds.filter((u) => u !== typingUserID));
      });

      // Listen for message errors
      socketRef.current.on('messageError', (error) => {
        console.error('Message error:', error);
        setToast({ error: error.message || 'Failed to send message' });
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
  }, [username, id, typingUserIds]);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!username) {
      setShouldNavigate(false);
      navigate('/');
    }
  }, [username, setShouldNavigate, navigate]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      setMessages([]);

      axios
        .get(`/messages/${selectedUser.userId}`)
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

  // Effect to perform emit activity when user is typing
  useEffect(() => {
    if (isTyping) {
      socketRef.current.emit('typing', { recipient: selectedUser });
    } else if (selectedUser) {
      socketRef.current.emit('typingEnded', {
        recipient: selectedUser,
      });
    }
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [id, isTyping, typingTimeout, selectedUser]);

  // Clear message input if chat is closed
  useEffect(() => {
    if (!selectedUser) {
      setMessage('');
    }
  }, [selectedUser]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    setIsTyping(true);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || !selectedUser) return;

    // Send message via socket
    socketRef.current.emit('sendMessage', {
      recipient: selectedUser,
      content: message,
    });

    setMessage('');
  };

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

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {toast && (
        <Toast
          message={Object.values(toast)[0]}
          type={Object.keys(toast)[0]}
          onClose={closeToast}
          duration={3000}
        />
      )}
      {/* Sidebar */}
      <div className='bg-white w-1/4 flex flex-col shadow-lg'>
        {/* App Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold flex items-center gap-3 p-4 shadow-md'>
          <BiMessageDetail className='w-7 h-7' />
          <span className='text-xl'>MERN Chat</span>
        </div>

        {/* Search Bar */}
        <div className='p-3 border-b border-gray-100'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search users...'
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredUsers = onlineUsers.filter((user) =>
                  user.username.toLowerCase().includes(searchTerm)
                );
                setSearchResults(filteredUsers);
              }}
              className='w-full bg-gray-50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
            />
            <IoSearchOutline className='h-5 w-5 text-gray-400 absolute left-3 top-2.5' />
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
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                typingUserIds={typingUserIds}
              />
            ))
          ) : (
            onlineUsers.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                typingUserIds={typingUserIds}
              />
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
              <RiLogoutBoxLine className='h-4 w-4' />
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
                    .find((u) => u.userId === selectedUser.userId)
                    ?.username.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className='font-medium'>
                    {
                      onlineUsers.find((u) => u.userId === selectedUser.userId)
                        ?.username
                    }
                  </div>
                  <div className='text-xs text-green-500 flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                    {typingUserIds.includes(selectedUser.userId)
                      ? 'typing...'
                      : 'Online'}
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  className='p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-inherit'
                  disabled={true}
                >
                  <HiPhone className='h-5 w-5' />
                </button>
                <button
                  className='p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-inherit'
                  disabled={true}
                >
                  <HiVideoCamera className='h-5 w-5' />
                </button>
                <button
                  className='p-2 text-gray-500 hover:bg-gray-100 rounded-full'
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                >
                  <BsThreeDotsVertical className='h-5 w-5' />
                </button>
                {dropdownVisible && (
                  <div className='absolute bg-white shadow-md rounded-md mt-10'>
                    <button
                      className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                      onClick={() => {
                        setSelectedUser(null);
                        setDropdownVisible(false);
                      }}
                    >
                      Close Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-grow p-4 overflow-y-auto bg-gray-50'>
              <div className='text-center p-4 mb-4 bg-white rounded-lg shadow-sm'>
                <p className='text-gray-500'>
                  This is the beginning of your conversation with{' '}
                  {
                    onlineUsers.find((u) => u.userId === selectedUser.userId)
                      ?.username
                  }
                </p>
              </div>

              {loading ? (
                <Spinner />
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
                <IoChatbubbleEllipsesOutline className='h-10 w-10 text-blue-600' />
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
              className='p-2 text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:hover:text-gray-500'
              disabled={true}
            >
              <FiPaperclip className='h-6 w-6' />
            </button>
            <input
              type='text'
              value={message}
              onChange={handleInputChange}
              placeholder='Type your message here'
              className='flex-grow py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
              disabled={!selectedUser}
            />
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 p-2 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!selectedUser || message.trim() === ''}
            >
              <IoMdSend className='w-6 h-6' />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
