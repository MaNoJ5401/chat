const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin, 
     getCurrentUser,
      userLeave,
       getRoomUsers 
     } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'DroiD Bot';

// Run when client connects 
io.on('connection', socket=> {
 socket.on('joinRoom', ({ username, room }) => {
const user = userJoin(socket.id, username, room);

socket.join(user.room);

    //welcome the current user
    socket.emit('message', formatMessage(botName, `Hello ${user.username}..! Welcome.`));

    // Broadcast when a user connects

    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the Room`));
 
//send users and room info 
io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});
});

    //listening the chat message 
    socket.on('chatMessage', msg => {
const user = getCurrentUser(socket.id);

        // send message to every user in a particular room 
       io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

//runs when client disconnects
socket.on('disconnect', () => {
    const user = userLeave(socket.id);

if (user) {
    io.to(user.room).emit(
        'message', 
        formatMessage(botName, `${user.username} is disconnected`));

        //send users and room info 
io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});
}
});
});  

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));