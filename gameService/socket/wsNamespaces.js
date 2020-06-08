const { socketIOServer } = require('./webSocket')
const Match = require('../model/match/match')

exports.createMatchNamespace = async () => {

    const match = await Match.buildMatch();
    const wordLockTime = 10000


    
    const nsp = Date.now();
    const socketNamespace = socketIOServer.of(nsp)

    socketNamespace.on('connection', (socket) => {
      console.log('user connected' + socket.id)  
      //socket.on('', () => {})

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
        match.disconnectPlayerByConnection(socket.id) 

        if(match.getConnectedPlayers().length <= 0){
          delete socketIOServer.nsps[nsp]   //delete if all disconnected
        }        
      })      

      socket.on('connectPlayer', (playerId) => {  
        const player = {
          id: playerId,
          socketId: socket.id
        }
        const connect = match.connectPlayer(player)
        if(connect){          
          socketNamespace.emit('players', match.getPlayers())
          socket.emit('dataMatrix', match.getDataMatrix())
          socket.emit('clues', match.getClues())
          socket.emit('lockedWords', match.getLockedWords())
          socket.emit('solvedWords', match.getSolvedWords())
          //socket.emit('players', match.getPlayers())
          socket.emit('player', match.getPlayer(playerId))
        }else{
          socket.emit('errorMessage', `Cannot connect player ${player.id}`)          
        }
      })

      socket.on('disconnectPlayer', (playerId) => {
        const player = {
          id: playerId
        }
        const disconnect = match.disconnectPlayer(player)
        if(disconnect){
          socketNamespace.emit('players', match.getPlayers())
        }else{
          socket.emit('errorMessage', `Cannot disconnect player ${player.id}`)
        }
      })

      socket.on('getPlayer', (playerId) => {
        const player = match.getPlayer(playerId)
        if(player){
          socket.emit('player', player)
        }else{
          socket.emit('errorMessage', `Cannot find player ${playerId}`)
        }
      })

      socket.on('lockWord', (word) => {
        const lock = match.lockWord(word)
        if(lock){
          socketNamespace.emit('lockedWords', match.getLockedWords())
          setTimeout(() => { 
            const unlock = match.unlockWord(word)
            if(unlock){
              socketNamespace.emit('lockedWords', match.getLockedWords())
            }else{
              socket.emit('errorMessage', `Cannot unlock word ${word.number} ${word.profile}`)
            }
          }, wordLockTime);
        }else{
          socket.emit('errorMessage', `Cannot lock word ${word.number} ${word.profile}`)
        }
      })

      socket.on('updateMatrix', (update) => {
        console.log(update)
      })

      
    })

    return nsp
}