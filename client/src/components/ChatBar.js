import React, { useState, useEffect } from 'react';

const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userName = localStorage.getItem('userName');

    if (userName) {
      // Nếu có, đăng ký người dùng lại với server
      socket.emit('newUser', { userName });
    }
    socket.on('newUserResponse', (data) => setUsers(data));
    socket.on('userLeft', (data) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.socketID !== data.socketID));
    });

    // Cleanup function
    return () => {
      socket.off('newUserResponse');
      socket.off('userLeft');
    };
  }, [socket, users]);
  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {users.map((user) => (
            <p key={user.socketID}>{user.userName}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;