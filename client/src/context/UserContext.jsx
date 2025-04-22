import axios from 'axios';
import { useEffect, useState } from 'react';
import { UserContext } from './UserContextValue';

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    axios.get('/profile').then((res) => {
      setId(res.data.userId);
      setUsername(res.data.activeUsername);
      setShouldNavigate(true);
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        id,
        setId,
        shouldNavigate,
        setShouldNavigate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
