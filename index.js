const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

let lampState = { on: true };

io.on('connection', (socket) => {
  socket.emit('lampStateUpdate', lampState);

  socket.on('toggleLamp', (state) => {
    lampState = state;
    io.emit('lampStateUpdate', state);
    console.log('État de la lampe mis à jour:', state);
  });
});

server.listen(3001, () => {
  console.log('Serveur Socket.io sur http://localhost:3001');
});