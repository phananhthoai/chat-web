import React, { useEffect, useState, useRef } from 'react';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);
  useEffect(() => {
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
  }, [socket, messages]);
  useEffect(() => {
    socket.on('fileReceived', (data) => {
      const blob = new Blob([data.file]);
      const url = URL.createObjectURL(blob);

      const fileData = {
        name: data.sender,
        text: `Đã gửi 1 file: <a href="${url}" download="${data.filename}">${data.filename}</a>`,
      };
      setMessages([...messages, fileData]);
    });

    return () => {
      socket.off('fileReceived'); // Dừng lắng nghe khi component unmount
    };
  }, [socket, messages]);
  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    let timeoutId = null;
    socket.on('typingResponse', (data) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setTypingStatus(data);
      timeoutId = setTimeout(() => setTypingStatus(null), 2000);
    });
  }, [socket]);
  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody socket={socket}
            messages={messages}
            typingStatus={typingStatus}
            lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket={socket} />
      </div>
    </div>
  );
};

export default ChatPage;