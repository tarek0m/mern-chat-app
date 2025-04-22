import EntryForm from './pages/EntryForm';
import Chat from './pages/Chat';
import axios from 'axios';
import { UserContextProvider } from './context/UserContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  axios.defaults.baseURL = 'http://localhost:8000';
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<EntryForm />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
