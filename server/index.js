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

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://root:example@172.17.0.4:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin'
});

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    email: {
        type: String,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        unique: true,
        match: [/^0\d{9}$/, 'Please enter a valid phone number starting with 0 and 10 digits long']
    }
}));
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({error: 'Access denied'});

    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({error: 'Invalid token'});
    }
};

app.post('/signup', async (req, res) => {
    const {username, password, email, phone} = req.body;
    if (!email || !phone) {
        return res.status(400).json({ error: 'Email and phone are required for signup' });
    }
    const userdb = await User.findOne({username});
    if (userdb) return res.status(400).json({error: 'User exist !'});
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({username, password: hashedPassword, email, phone});
    await user.save();
    res.json({message: 'User created successfully'});
});

// Sign in route
app.post('/signin', async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    if (!user) return res.status(400).json({error: 'User not found'});

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({error: 'Invalid password'});

    const token = jwt.sign({_id: user._id}, 'your_jwt_secret');
    res.json({token});
});

const users = new Map();

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('newUser', (data) => {
        if (!data.userName) return;

        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = Array.from(users.values()).find(user => user.userName === data.userName);
        if (existingUser) {
            // Nếu user đã tồn tại, cập nhật socketID
            users.delete(existingUser.socketID);
            existingUser.socketID = socket.id;
            users.set(socket.id, existingUser);
        } else {
            // Nếu là user mới, thêm vào Map
            users.set(socket.id, { ...data, socketID: socket.id });
            socketIO.emit('messageResponse', {
                name: 'bot',
                text: 'A new user ' + data.userName,
            });
        }

        socketIO.emit('newUserResponse', Array.from(users.values()));
    });
    socket.on('typing', (data) => {
        socket.broadcast.emit('typingResponse', data)
    });

    socket.on('hello', () => {
        socket.emit('newUserResponse', Array.from(users.values()));
    });
    socket.on('message', (data) => {
        console.log(data)
        socketIO.emit('messageResponse', data);
    });
    socket.on('upload', (sender, name, fileData, callback) => {
        socket.broadcast.emit('fileReceived', {
            filename: name,
            file: fileData,
            sender: sender,
        });
        callback({ status: 'File uploaded successfully' });
    });

    socket.on('leaveChat', () => {
        if (users.has(socket.id)) {
            const userName = users.get(socket.id).userName;
            users.delete(socket.id);
            socketIO.emit('userLeft', { socketID: socket.id, userName: userName });
            socketIO.emit('newUserResponse', Array.from(users.values()));
            socketIO.emit('messageResponse', {
                name: 'bot',
                text: userName + ' has left the chat',
            });
        }
    });


    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        if (users.has(socket.id)) {
            const userName = users.get(socket.id).userName;
            users.delete(socket.id);
            socketIO.emit('userLeft', { socketID: socket.id, userName: userName });
            socketIO.emit('newUserResponse', Array.from(users.values()));
            socketIO.emit('messageResponse', {
                name: 'bot',
                text: userName + ' has disconnected',
            });
        }
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