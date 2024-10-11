const express = require('express');
const app = express();
const PORT = 4000;

const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http, {
  cors: {
      origin: "*"
  }
});
app.use(cors());
let users = [];
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('newUser', (data) => {
    socketIO.emit('messageResponse', {
      name: 'bot',
      text: 'A new user ' + data.userName,
    });
  });
  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
  });
  socket.on('hello', () => {
    socket.emit('newUserResponse', users);
  });

  socket.on('message', (data) => {
    console.log(data)
    socketIO.emit('messageResponse', data);
  });
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});