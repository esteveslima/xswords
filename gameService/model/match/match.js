const fetch = require("node-fetch");

module.exports = class Match{

  #playerColors = [
    {R: 255, G: 0, B: 0},
    {R: 0, G: 255, B: 0},
    {R: 0, G: 0, B: 255},
    {R: 255, G: 255, B: 0},
    {R: 255, G: 0, B: 255},
    {R: 0, G: 255, B: 255},    
  ]  //dessa forma só suporta 6 players(implementar gerador de cores dinamico)

  #dataMatrix = undefined;
  #clues = [];
  #lockedWords = [];
  #solvedWords = [];
  #players = [];  

  constructor(rawMatchData){
    if(rawMatchData === undefined) throw new Error('Class must be created with the builder method')
    this.#initDataMatrix(rawMatchData);
    this.#initClues(rawMatchData);
    this.#initWordsLists();
    this.#initPlayers();
  }



  //implementado padrão construtor para poder criar o objeto de forma assincrona
  //não foi encontrado alguma forma de tornar construtor private
  static buildMatch = async () => {   
    //implementar numero de tentativas para evitar retornar json errado
    const year = Math.floor(1976 + Math.random()*41)        //gera até 2016 apenas
    const month = ('0' + Math.floor(Math.random()*12 + 1)).slice(-2)  //refatorar 
    const day = ('0' + Math.floor(Math.random()*28 + 1)).slice(-2)
          
    const response = await fetch(`https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${year}/${month}/${day}.json`, {
      method: "GET"        
    })        
    const rawMatchData = await response.json()    
        
    return new Match(rawMatchData)
  }

  #initDataMatrix = (rawMatchData) => {       
      const gridMatrix = new Array(rawMatchData.size.rows)
      for(let line = 0; line < rawMatchData.size.rows; line++){
        gridMatrix[line] = new Array(rawMatchData.size.cols)        
        for(let col = 0; col < rawMatchData.size.cols; col++){
          const element = rawMatchData.grid[line*rawMatchData.size.cols + col]
          const clueNumber = rawMatchData.gridnums[line*rawMatchData.size.cols + col]

          //separa as letras e numero das dicas
          gridMatrix[line][col] = {
            element: element,         //conteudo da celula exibido no momento: letra(caractere), espaços de divisão("."), nao exibido(null)
            clueNumber: clueNumber,   //numero da dica para exibição, serve de orientação ao jogador
            acrossWord: undefined,    //numero da palavra 'across' a que esta celula se refere
            downWord: undefined       //numero da palavra 'down' a que esta celula se refere            
          }                   
        }        
      }


      
      for(let line = 0; line < gridMatrix.length; line++){   
        let lastAcrossClue         
        for(let col = 0; col < gridMatrix[line].length; col++){
          const element = gridMatrix[line][col].element
          const clueNumber = gridMatrix[line][col].clueNumber

          //atribui cada letra a sua palavra 'across', baseado no numero da dica
          if(!lastAcrossClue){
            lastAcrossClue = clueNumber
            gridMatrix[line][col].acrossWord = lastAcrossClue === 0 ? undefined : lastAcrossClue
          }else{
            const isletter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");          
            if(isletter){
              gridMatrix[line][col].acrossWord = lastAcrossClue === 0 ? undefined : lastAcrossClue
            }else{
              lastAcrossClue = undefined
            }
          } 
        }
      }

      for(let col = 0; col < gridMatrix.length; col++){  
        let lastDownClue         
        for(let line = 0; line < gridMatrix[col].length; line++){
          const element = gridMatrix[line][col].element
          const clueNumber = gridMatrix[line][col].clueNumber

          //atribui cada letra a sua palavra 'down', baseado no numero da dica
          if(!lastDownClue){
            lastDownClue = clueNumber
            gridMatrix[line][col].downWord = lastDownClue === 0 ? undefined : lastDownClue
          }else{
            const isletter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");          
            if(isletter){
              gridMatrix[line][col].downWord = lastDownClue === 0 ? undefined : lastDownClue
            }else{
              lastDownClue = undefined
            }
          } 
        }
      }

      this.#dataMatrix = gridMatrix;
  }
  #initClues = (rawMatchData) => {
    this.#clues = rawMatchData.clues
  }
  #initWordsLists = () => {
    this.#lockedWords = [];
    this.#solvedWords = [];
  }
  #initPlayers = () => {
    this.#players = [];
  }



  getDataMatrix = () => { return this.#dataMatrix; }
  getClues = () => { return this.#clues; }
  getLockedWords = () => { return this.#lockedWords; }
  getSolvedWords = () => { return this.#solvedWords; }
  getPlayers = () => { return this.#players; }
  getConnectedPlayers = () => { return this.#players.filter((player) => player.connected === true); }  
  getPlayer = (playerId) => { return this.#players.find((player) => player.id === playerId); }



  lockWord = (word) => {
    for(let solvedWord of this.#solvedWords){    //checa se esta na lista de palavras resolvidas
      if(solvedWord.number === word.number && solvedWord.profile === word.profile) return false;
    }
    for(let lockedWord of this.#lockedWords){  //checa se esta na lista de palavras travadas
      if(lockedWord.number === word.number && lockedWord.profile === word.profile) return false;
    }

    this.#lockedWords = [...this.#lockedWords, word]    
    return true
  }
  unlockWord = (word) => {
    this.#lockedWords = this.#lockedWords.filter((lockedWord) => 
      lockedWord.number !== word.number || lockedWord.profile !== word.profile
    )
    return true;
  }

  updateDataMatrix = (update) => {

  }

  connectPlayer = (connectedPlayer) => {
    for(let player of this.#players){
      if(player.id === connectedPlayer.id){
        player.connected = true
        return true
      }
    }
    
    return this.#initPlayer(connectedPlayer)    
  }  
  #initPlayer = (player) => {
    player.connected = true
    player.score = 0
    player.color = this.#playerColors[this.#players.length]
    this.#players = [...this.#players, player]
    return true;
  }
  disconnectPlayer = (disconnectedPlayer) => {
    for(let player of this.#players){
      if(player.id === disconnectedPlayer.id){
        player.connected = false
        return true
      }
    }

    return false;
  }
  disconnectPlayerByConnection = (socketId) => {    
    for(let player of this.#players){
      if(player.id === socketId){
        player.connected = false
        return true
      }
    }

    return false;
  }
  #incrementPlayerScore = (updatedPlayer, addedPoints) => {
    for(let player of this.#players){
      if(player.id === updatedPlayer.id){
        player.score += addedPoints
        return true
      }
    }

    return false;
  }

}