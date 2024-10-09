const express = require('express');
const app = express();
const PORT = 4000;

//New imports
const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http, {
  cors: {
      origin: "*"
  }
});
app.use(cors());

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('newUser', (data) => {
    socketIO.emit('messageResponse', {
      name: 'bot',
      text: 'A new user ' + data.userName,
    });
  });
  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
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