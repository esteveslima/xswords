const http = require('http')
const io = require('socket.io')



const socketIO = http.createServer();
const socketIOServer = io(socketIO);

socketIO.listen(
  process.env.PORT_SOCKETIO,
  console.log(`${process.env.NODE_ENV} game socket server, running on port ${process.env.PORT_SOCKETIO}`)
);



module.exports.socketIOServer = socketIOServer