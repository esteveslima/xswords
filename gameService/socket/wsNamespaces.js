const fetch = require("node-fetch");
const jwt = require('jsonwebtoken')
const { USER_SERVER } = require('../config/urls')

async function updatePlayersScores(matchPlayers){
  const players = matchPlayers.map((player) => p = {
    id: player.id,
    score: player.score,
  })
  try{
    const authToken = jwt.sign({ id: 'gameService' }, process.env.USER_SERVICE_JWT_SECRET, { expiresIn: process.env.GAME_SERVICE_JWT_EXPIRES })
    const response = await fetch(`${USER_SERVER}/user/updatePlayersScores`, {
      method: "POST",
      headers: { 
        'Authorization' : `Bearer ${authToken}`,
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ players: players }),                
    })                
    

    if (response.status === 200) {  
      //var json = await response.json()          
      return true;
    } else {       
      console.log('Error while updating players score')
      return false;
    }
  }catch(e){
    console.log('Error while updating players score')
    return false;
  }
}

exports.createMatchNamespace = async () => {

    const { socketIO } = require('./webSocket')
    const Match = require('../model/match/match')
    
    //cria partida e define seus parametros
    let match = await Match.buildMatch();
    if(match === undefined) return undefined;
    const wordLockTime = process.env.WORD_LOCK_TIME
    let matchDuration = process.env.MATCH_DURATION
    const matchTimeUpdate = 1000;

    
    //cria o namespace da partida
    const nsp = Date.now();
    const socketNamespace = socketIO.of(nsp)

    //inicia o timer da partida
    const matchTimer = setInterval(async () => {
      matchDuration -= matchTimeUpdate;      
      if(matchDuration > 0) return;

      //fim de partida, atualiza score dos jogadores conectados
      await updatePlayersScores(match.getConnectedPlayers());

      //envia mensagem de fim de jogo e deleta partida
      socketNamespace.emit('gameOver')      
      const connectedNameSpaceSockets = Object.keys(socketNamespace.connected);
      connectedNameSpaceSockets.forEach(socketId => {
          socketNamespace.connected[socketId] && socketNamespace.connected[socketId].disconnect();
      });
      socketNamespace.removeAllListeners(); 
      delete socketIO.nsps['/'+nsp]
      //match = undefined
    }, matchTimeUpdate);
 


    //instancia os callbacks para cada evento do ws
    socketNamespace.on('connection', (socket) => {
      console.log('user connected' + socket.id)  
      //socket.on('', () => {})

      socket.on('disconnect', () => {
        if(match === undefined) return
        console.log('user disconnected' + socket.id)
        match.disconnectPlayerByConnection(socket.id) 
        socketNamespace.emit('players', match.getPlayers())
        
        if(match && match.getConnectedPlayers().length <= 0){    //delete match if all players disconnected
          const connectedNameSpaceSockets = Object.keys(socketNamespace.connected);
          connectedNameSpaceSockets.forEach(socketId => {
              socketNamespace.connected[socketId] && socketNamespace.connected[socketId].disconnect();
          });
          socketNamespace.removeAllListeners(); 
          delete socketIO.nsps['/'+nsp]
          matchTimer && clearInterval(matchTimer)
          //match = undefined
          console.log('match deleted due to lack of connections')
        }        
      })      

      socket.on('connectPlayer', (clientPlayer) => {  
        const player = {
          id: clientPlayer.id,
          nickName: clientPlayer.nickName,
          socketId: socket.id
        }
        const connect = match.connectPlayer(player)
        if(connect){
          socketNamespace.emit('players', match.getPlayers())
          socket.emit('timer', matchDuration)
          socket.emit('dataMatrix', match.getMatchMatrix())
          socket.emit('clues', match.getClues())
          socket.emit('lockedWords', match.getLockedWords())
          socket.emit('solvedWords', match.getSolvedWords())
          //socket.emit('players', match.getPlayers())
          socket.emit('player', match.getPlayer(clientPlayer.id))
          socket.emit('matchInfo', match.getMatchInfo())
        }else{
          socket.emit('errorMessage', `Cannot connect player ${player.id}`)          
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

      socket.on('updateMatrix', async (update) => {
        const updateMatch = match.updateMatchMatrix(update)

        socketNamespace.emit('dataMatrix', match.getMatchMatrix())    //a cada alteração, os dados são repassados a todos os jogadores

        if(updateMatch){      //caso tenha terminado de inserir as letras
          //desbloqueia a palavra(necessário pois a palavra pode não ter sido resolvida)
          const word = update.word
          const unlock = match.unlockWord(word)
          if(unlock){
            socketNamespace.emit('lockedWords', match.getLockedWords())
          }else{
            socket.emit('errorMessage', `Cannot unlock word ${word.number} ${word.profile}`)
          }
          //atualiza a lista de palavras resolvidas e score de players(para caso ter sido resolvido)
          socketNamespace.emit('solvedWords', match.getSolvedWords())
          socketNamespace.emit('players', match.getPlayers())
          const matchSolved = match.isMatchSolved();
          if(matchSolved){
            //fim de partida, atualiza score dos jogadores conectados
            await updatePlayersScores(match.getConnectedPlayers());

            //envia mensagem de fim de jogo e deleta partida
            socketNamespace.emit('gameOver')      
            const connectedNameSpaceSockets = Object.keys(socketNamespace.connected);
            connectedNameSpaceSockets.forEach(socketId => {
                socketNamespace.connected[socketId] && socketNamespace.connected[socketId].disconnect();
            });
            socketNamespace.removeAllListeners(); 
            delete socketIO.nsps['/'+nsp]
            matchTimer && clearInterval(matchTimer)
            //match = undefined
            console.log(`match solved! (nsp: ${nsp})`)
          }
        }else{              
          //enquanto todas as letras não tiverem sido inseridas
        }        
      })

      
    })

    //retorna o namespace da partida criada
    return nsp
}



exports.verifyMatchNamespace = async (nameSpace) => {

    const { socketIO } = require('./webSocket')
    
    return Object.keys(socketIO.nsps).includes('/' + nameSpace)

}