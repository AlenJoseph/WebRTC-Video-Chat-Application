const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user is connected');
  socket.on('create or join', (room) => {
    const myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
    const numClients = myRoom.length;
    console.log(room, ' has ', numClients, ' clients ');

    if (numClients == 0) {
      socket.join(room);
      socket.emit('created', room);
    } else if (numClients == 1) {
      socket.join(room);
      socket.emit('joined', room);
    } else {
      socket.emit('full', room);
    }
  });

  socket.on('ready', (room) => {
    socket.broadcast.to(room).emit('ready');
  });
  socket.on('candidate', (event) => {
    socket.broadcast.to(event.room).emit('candidate', event);
  });
  socket.on('offer', (event) => {
    socket.broadcast.to(event.room).emit('offer', event.sdp);
  });

  socket.on('answer', (event) => {
    socket.broadcast.to(event.room).emit('answer', event.sdp);
  });
});

http.listen(port, () => console.log(`Server is running on ${port}`));
