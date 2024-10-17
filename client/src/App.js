import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChatPage from './components/ChatPage';
import {io} from 'socket.io-client';
import { useEffect, useState } from 'react';

export default function App() {
  const [socket, setSocket] = useState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('wss://backends.hocdevops.me', {
      transports: ['websocket'],
    });
    
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('hello');
    });
    socket.open();
    setSocket(socket);
  }, []);
  
  if (!isConnected || !socket) {
    return <>Loading ...</>;
  }
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home socket={socket} />}></Route>
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}