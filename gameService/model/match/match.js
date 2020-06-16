const fetch = require("node-fetch");

module.exports = class Match{

  #playerColors = [
    {R: 255, G: 0, B: 0},
    {R: 0, G: 255, B: 0},
    {R: 0, G: 0, B: 255},
    {R: 255, G: 255, B: 0},
    {R: 255, G: 0, B: 255},
    {R: 0, G: 255, B: 255},
    {R: 125, G: 0, B: 0},
    {R: 0, G: 125, B: 0},
    {R: 0, G: 0, B: 125},
    {R: 125, G: 125, B: 0},
    {R: 125, G: 0, B: 125},
    {R: 0, G: 125, B: 125},
    {R: 125, G: 0, B: 0},
    {R: 0, G: 125, B: 0},
    {R: 0, G: 0, B: 125},
    {R: 125, G: 125, B: 0},
    {R: 125, G: 0, B: 125},
    {R: 0, G: 125, B: 125},   
  ]  //dessa forma só suporta o numero de cores de players(implementar gerador de cores dinamico)

  #dataMatrix = undefined;      //matriz com os dados puros(gabarito)
  #matchMatrix = undefined;     //matriz que representa o estado atual do jogo
  #clues = [];                  //lista das dicas across e down
  #answers = [];                //lista de respostas de cada dica  
  #lockedWords = [];            //lista de palavras travadas pelos jogadores
  #solvedWords = [];            //lista de palavras resolvidas pelos jogadores
  #players = [];                //lista de jogadores que abriram conexão com o namespace do ws
  #matchInfo = undefined        //informações da palavra cruzada do nyt gerada


  constructor(rawMatchData){    //deve seguir esta ordem pois alguns dados podem depender de outros
    if(rawMatchData === undefined) throw new Error('Class must be created with the builder method')    
    this.#initClues(rawMatchData);              
    this.#initAnswers(rawMatchData);            //copia o numero das dicas, já que são listas pareadas
    this.#initDataMatrices(rawMatchData);       
    this.#initWordsLists();
    this.#initPlayers();
    this.#initMatchInfo(rawMatchData);
  
//console.log(this.#answers)    //print das respostas para teste
  }



  //implementado padrão construtor para poder criar o objeto de forma assincrona
  //não foi encontrado alguma forma de tornar construtor private
  static buildMatch = async () => {   
    //implementar numero de tentativas para evitar retornar json errado
    const year = Math.floor(1976 + Math.random()*41)        //gera até 2016 apenas
    const month = ('0' + Math.floor(Math.random()*12 + 1)).slice(-2)  //refatorar 
    const day = ('0' + Math.floor(Math.random()*28 + 1)).slice(-2)
    try{
      const response = await fetch(`https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${year}/${month}/${day}.json`, {
        method: "GET"        
      })     
      if(response.status === 200){
        const rawMatchData = await response.json()    
        return new Match(rawMatchData)
      }else{
        return undefined;
      }
    }catch(e){
      console.log(e)
      return undefined;
    }
        
  }

  #initDataMatrices = (rawMatchData) => {       
      const gridMatrix = new Array(rawMatchData.size.rows)
      for(let line = 0; line < rawMatchData.size.rows; line++){   //separa o conteudo e o numero da dica(exibição)
        gridMatrix[line] = new Array(rawMatchData.size.cols)        
        for(let col = 0; col < rawMatchData.size.cols; col++){
          const element = rawMatchData.grid[line*rawMatchData.size.cols + col]          
          const clueNumber = rawMatchData.gridnums[line*rawMatchData.size.cols + col]

          //separa as letras e numero das dicas
          gridMatrix[line][col] = {
            element: element,             //conteudo da celula exibido no momento: letra(caractere), espaços de divisão("."), nao exibido(null)
            clueNumber: clueNumber,       //numero da dica para exibição, serve de orientação ao jogador
            acrossWord: undefined,        //numero da palavra 'across' a que esta celula se refere
            downWord: undefined           //numero da palavra 'down' a que esta celula se refere            
          }                   
        }        
      }
      
      for(let line = 0; line < gridMatrix.length; line++){       //atribui em cada letra a sua palavra 'across', baseado no numero da dica
        let lastAcrossClue         
        for(let col = 0; col < gridMatrix[line].length; col++){
          const element = gridMatrix[line][col].element
          const clueNumber = gridMatrix[line][col].clueNumber
          
          if(!lastAcrossClue){
            lastAcrossClue = clueNumber
            gridMatrix[line][col].acrossWord = lastAcrossClue === 0 ? undefined : lastAcrossClue
          }else{
            const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");          
            if(isLetter){
              gridMatrix[line][col].acrossWord = lastAcrossClue === 0 ? undefined : lastAcrossClue
            }else{
              lastAcrossClue = undefined
            }
          } 
        }
      }
      
      for(let col = 0; col < gridMatrix.length; col++){       //atribui em cada letra a sua palavra 'down', baseado no numero da dica
        let lastDownClue         
        for(let line = 0; line < gridMatrix[col].length; line++){
          const element = gridMatrix[line][col].element
          const clueNumber = gridMatrix[line][col].clueNumber
          
          if(!lastDownClue){
            lastDownClue = clueNumber            
            gridMatrix[line][col].downWord = lastDownClue === 0 ? undefined : lastDownClue
          }else{
            const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");          
            if(isLetter){
              gridMatrix[line][col].downWord = lastDownClue === 0 ? undefined : lastDownClue
            }else{
              lastDownClue = undefined
            }
          } 
        }
      }
      
      //copiando dados da matriz
      this.#dataMatrix = gridMatrix.map((matrixRow) => {        
        return matrixRow.map((matrixField) => {
          return {...matrixField}
        })
      })
      
      //copiando dados da matriz removendo as letras(para representar a partida)
      this.#matchMatrix = gridMatrix.map((matrixRow) => {        
        return matrixRow.map((matrixField) => {
          let element = matrixField.element;
          const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
          if(isLetter) matrixField.element = null;
          return matrixField
        })
      })
  }
  #initClues = (rawMatchData) => {
    const across = rawMatchData.clues.across.map((acrossClue) => {
      return {
        description: acrossClue,
        number: +acrossClue.substr(0, acrossClue.indexOf('.'))
      }      
    })
    const down = rawMatchData.clues.down.map((downClue) => {
      return {
        description: downClue,
        number: +downClue.substr(0, downClue.indexOf('.'))
      }
    })
    
    this.#clues = {across, down}    
  }
  #initAnswers = (rawMatchData) => {
    const across = rawMatchData.answers.across.map((acrossAnswer) => {
      const currentIndex = rawMatchData.answers.across.indexOf(acrossAnswer)
      return {
        value: acrossAnswer,
        clueNumber: this.#clues.across[currentIndex].number
      }
    })
    const down = rawMatchData.answers.down.map((downAnswer) => {
      const currentIndex = rawMatchData.answers.down.indexOf(downAnswer)
      return {
        value: downAnswer,
        clueNumber: this.#clues.down[currentIndex].number
      }
    })
    
    this.#answers = {across, down}
  }
  #initWordsLists = () => {
    this.#lockedWords = [];
    this.#solvedWords = [];
  }
  #initPlayers = () => {
    this.#players = [];
  }
  #initMatchInfo = (rawMatchData) => {
    this.#matchInfo = rawMatchData.title
  }



  #initPlayer = (player) => {
    player.connected = true
    player.score = 0
    player.color = this.#playerColors[this.#players.length]
    this.#players = [...this.#players, player]
    return true;
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
  #isWordSolved = (word) => { 
    for(let solvedWord of this.#solvedWords){    //checa se esta na lista de palavras resolvidas
      if(solvedWord.number === word.number && solvedWord.profile === word.profile) return true;
    }
    return false;
  }
  #isWordLocked = (word) => {
    for(let lockedWord of this.#lockedWords){  //checa se esta na lista de palavras travadas
      if(lockedWord.number === word.number && lockedWord.profile === word.profile) return true;
    }
    return false;
  }


  getMatchInfo = () => { return this.#matchInfo; }
  getMatchMatrix = () => { return this.#matchMatrix; }
  getClues = () => { return this.#clues; }
  getLockedWords = () => { return this.#lockedWords; }
  getSolvedWords = () => { return this.#solvedWords; }
  getPlayers = () => { return this.#players; }
  getConnectedPlayers = () => { 
    return this.#players.filter((player) => player.connected === true); 
  }  
  getPlayer = (playerId) => { 
    return this.#players.find((player) => player.id === playerId); 
  }



  lockWord = (word) => {
    if(this.#isWordSolved(word) || this.#isWordLocked(word)) return false;

    this.#lockedWords = [...this.#lockedWords, word]    
    return true;
  }
  unlockWord = (word) => {
    if(!this.#isWordLocked) return true;
    this.#lockedWords = this.#lockedWords.filter((lockedWord) => 
      lockedWord.number !== word.number || lockedWord.profile !== word.profile
    )
    return true;
  }

  updateMatchMatrix = (update) => {    

    SearchStartIndexByClue: for(let [rowIndex, matrixRow] of this.#matchMatrix.entries()){
      for(let [colIndex, matrixField] of matrixRow.entries()){
        if(matrixField.clueNumber === update.word.number){
          update.startIndex = {
            row: rowIndex,
            col: colIndex
          }
          break SearchStartIndexByClue;
        }
      }
    }
    let matrixIndex = update.startIndex;     //indice a ser usado para cada campo para atualização

    for(let entryIndex = 0; entryIndex < update.entry.length ; entryIndex++){    //baseado na entrada recebida, insere cada letra na matriz a partir do indice da dica
      const letter = update.entry[entryIndex]

      //ignora entradas invalidas
      const element = letter.toUpperCase()
      const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
      if(!isLetter) continue;
      
      //testa se o campo pode ser alterado(não pertence a alguma palavra resolvida)
      const currentFieldWords = {
        across: {
          number: this.#matchMatrix[matrixIndex.row][matrixIndex.col].acrossWord,
          profile: 'across'
        },
        down: {
          number: this.#matchMatrix[matrixIndex.row][matrixIndex.col].downWord,
          profile: 'down'
        }
      }            
      const isLetterSolved = this.#isWordSolved(currentFieldWords.across) || this.#isWordSolved(currentFieldWords.down)
      if(isLetterSolved){
        //insere o valor ja resolvido atual do campo na string de entrada
        update.entry = update.entry.slice(0, entryIndex) + this.#matchMatrix[matrixIndex.row][matrixIndex.col].element + update.entry.slice(entryIndex)
        //entryIndex--;   //mantém a letra em análise para a próxima iteração, enquanto atualiza a posição do campo na matriz
      }else{
        this.#matchMatrix[matrixIndex.row][matrixIndex.col].element = letter  //atualiza o valor do campo     
      }     

      //atualiza o campo para o próximo a ser alterado
      if(update.word.profile === 'across') matrixIndex.col++;
      if(update.word.profile === 'down') matrixIndex.row++; 
      
      //testa se chegou ao final da entrada de dados
      const overflowMatrixLimits = (matrixIndex.row >= this.#matchMatrix.length) || (matrixIndex.col >= this.#matchMatrix.length)
      const foundDivider = !overflowMatrixLimits && this.#matchMatrix[matrixIndex.row][matrixIndex.col].element === '.'
      if(overflowMatrixLimits || foundDivider){   //finalizou de inserir a palavra                
        
        const answer = this.#answers[update.word.profile].find((answerObject) => {
          return answerObject.clueNumber === update.word.number}
        ).value

        //devido ao bug de não se solucionar outras palavras ao se solucioanr uma com sentido oposto, deve-se reduzir a entrada para que pelo menos o primeiro que digitar algo receba a pontuação daquela palavra acidentalmente solucionada mas não reclamada por ninguem
        update.entry = update.entry.substring(0, answer.length)

        //checa se palavra inserida foi solucionada
        if(update.entry === answer){                             
          //DEVERIA VARRER CADA LETRA DA PALAVRA RECEM RESOLVIDA, PROCURANDO OUTRAS POSSIVEIS SOLUCIONADAS
          //LEMBRAR DE DESTRAVAR OS JOGADORES LIGADOS À ESSAS PALAVRAS DA VARREDURA 
          //CRIAR METODO PARA RECUPERAR PALAVRA A PARTIR DO DATAMATRIX
          //PASSAR A VERIFICAR PELO METODO CRIADO AO INVES DE PROCURAR A RESPOSTA NA LISTA DE RESPOSTAS          
          this.#solvedWords = [...this.#solvedWords, update.word]
          this.#incrementPlayerScore(update.word.player, answer.length*10)
        }

        return true;
      }
    }

    return false;
  }  

  connectPlayer = (connectedPlayer) => {    
    const player = this.#players.find((player) => player.id === connectedPlayer.id);    
    if(player){
      player.socketId = connectedPlayer.socketId
      player.connected = true
      return true
    }else{
      return this.#initPlayer(connectedPlayer) 
    }
  }    
  /*disconnectPlayer = (disconnectedPlayer) => {
    const player = this.#players.find((player) => player.id === disconnectedPlayer.id).connected = false;
    return player ? true : false 
  }*/
  disconnectPlayerByConnection = (socketId) => {
    if(this.getPlayers().length <= 0) return false; 
    const player = this.#players.find((player) => player.socketId === socketId)
    if(player) player.connected = false
    return player ? true : false 
  }
  

}