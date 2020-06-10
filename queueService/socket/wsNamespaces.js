const { socketIOServer } = require('./webSocket')


exports.createQueueNamespace = async () => {
 
    const nsp = "crosswordsMatchmaking";
    const socketNamespace = socketIOServer.of(nsp)

    socketNamespace.on('connection', (socket) => {
      console.log('user connected' + socket.id)  
      //socket.on('', () => {})

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
              
      })      

      

      
    })

    return nsp
}