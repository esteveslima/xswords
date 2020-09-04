const http = require('http')
const io = require('socket.io')

const express = require('../api/express')



const server = http.createServer(express.app);
const socketIO = io(server, {
  path: `/${process.env.GAME_WS_ROUTE}`
});

server.listen(
  process.env.PORT,
  console.log(`${process.env.NODE_ENV} game server, running on port ${process.env.PORT}`)
);



module.exports.socketIO = socketIO
