exports.createQueueNamespace = async () => {

    const { socketIO } = require('./webSocket')
 

    
    const nsp = "crosswordsMatchmaking";
    const socketNamespace = socketIO.of(nsp)

    socketNamespace.on('connection', (socket) => {
      console.log('user connected' + socket.id)  
      //socket.on('', () => {})

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
              
      })      

      

      
    })

    return nsp
}