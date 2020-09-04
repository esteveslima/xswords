exports.createQueueNamespace = async () => {

    const { socketIO } = require('./webSocket')
    const Queue = require('../model/queue/queue')
    

    const queue = new Queue();
    const nsp = "crosswordsMatchmaking";    
    const socketNamespace = socketIO.of(nsp)

    socketNamespace.on('connection', (socket) => {
      console.log('user connected' + socket.id)  
      //socket.on('', () => {})

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
        queue.disconnectPlayerByConnection(socket.id)
      })      

      socket.on('connectPlayer', async (playerId) => {
        const player = {
          id: playerId,
          socketId: socket.id
        }
        const connect = await queue.connectPlayer(player)
        if(connect){
          const newMatch = await queue.manageQueue()
          if(newMatch){
            //envia para cada jogador da partida o endpoint relacionado àquela partida
            const match = {
              path: newMatch.path,
              nameSpace: newMatch.namespace
            }            
            newMatch.players.forEach((player) => socketNamespace.sockets[player.socketId].emit('match', match))            
          }
        }else{
          const playerInGame = queue.getConnectedPlayer(player)
          const playerMatchEndpoint = playerInGame.match       
          socket.emit('match', playerMatchEndpoint)                   
        }     
      })


      
    })

  return nsp
}