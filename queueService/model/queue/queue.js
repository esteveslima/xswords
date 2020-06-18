const fetch = require("node-fetch");
const { GAME_SERVER } = require('../../config/urls')

module.exports = class Queue{

  #queuePlayersList = [];      //lista de jogadores na fila
  #connectedPlayersList = [];  //lista de jogadores em jogo
  #matchPlayersNumber = 2;

  constructor(){
    
  }

  getQueuePlayers = () => { return this.#queuePlayersList; }
  getConnectedPlayers = () => { return this.#connectedPlayersList; }
  getQueuePlayer = (player) => { return this.#queuePlayersList.find((queuePlayer) => queuePlayer.id === player.id); }
  getConnectedPlayer = (player) => { return this.#connectedPlayersList.find((connectedPlayer) => connectedPlayer.id === player.id); }


  connectPlayer = async (player) => {
    const connectedPlayer = this.getConnectedPlayer(player)
    if(connectedPlayer){
      const playerMatchNamespace = connectedPlayer.match.substr(connectedPlayer.match.lastIndexOf('/') + 1)      
      const playerMatchExists = await this.#verifyMatchExists(playerMatchNamespace)
      if(playerMatchExists){        
        return false;   //player ja conectado a algum jogo em andamento
      }else{
        //remove da lista de conectados todos os players da partida que não existe
        this.#connectedPlayersList = this.#connectedPlayersList.filter((connectedPlayerFromList) => { 
          return connectedPlayerFromList.match !== connectedPlayer.match
        })
      }
    }

    //adiciona player à lista da queue
    if(!this.getQueuePlayer(player)){
      this.#queuePlayersList.push(player);
    }
    return true;    
  }
  disconnectPlayerByConnection = (socketId) => {
    if(this.getQueuePlayers().length <= 0) return false; 
    this.#queuePlayersList = this.#queuePlayersList.filter((player) => player.socketId !== socketId)
    return true
  }


  manageQueue = async () => {
    //unica logica para esta queue é possuir um determinado numero de players
    if(this.#queuePlayersList.length >= this.#matchPlayersNumber){
      const newMatchPlayers = this.#queuePlayersList

      //faz requisição ao server do jogo por uma partida nova
      const newMatchNamespace = await this.#requestNewMatchNamespace()      
      if(!newMatchNamespace) return false
      const gameWSEndpoint = `${GAME_SERVER}/${newMatchNamespace}`
      
      //marca os players com o namespace em que estão conectados
      newMatchPlayers.forEach((matchPlayer) => {
        Object.assign(matchPlayer, {match: gameWSEndpoint})
        this.#connectedPlayersList.push(matchPlayer)
      })
      //remove os players conectados da queue
      this.#queuePlayersList = this.#queuePlayersList.filter((queuePlayer) => {
        return !newMatchPlayers.map((matchPlayer) => matchPlayer.id).includes(queuePlayer.id)
      })
      
      const newMatch = {
        endpoint: gameWSEndpoint,
        players: newMatchPlayers
      }
      return newMatch
    }

    return false;
  }

  #requestNewMatchNamespace = async () => {
    for(let attempt = 0; attempt < 5; attempt++){
      const response = await fetch(`${GAME_SERVER}/generateMatch`, {
        method: "GET"        
      })
      const json = await response.json()
      if(json.status){        
        return json.nameSpace
      }
    }
    return false;
  }

  #verifyMatchExists = async (matchNamespace) => {      
    const response = await fetch(`${GAME_SERVER}/verifyMatch/${matchNamespace}`, {
      method: "GET",
    })
    const json = await response.json()
    return json.status
  }

}