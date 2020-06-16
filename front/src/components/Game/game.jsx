import React, { Component } from 'react'
import { Drawer, List, Avatar, message} from 'antd';
import { ArrowDownOutlined, ArrowRightOutlined, LoadingOutlined} from '@ant-design/icons';
import './game.css'
import io from "socket.io-client";


export default class Game extends Component {

  #user = undefined;            //informações do jogador cliente
  #socketIOClient = undefined; //referência ao socket recebido para conexão  
  
  #typedStringBuilt = '';     //string sendo construída na digitação
  #myself = undefined;       //cópia do player do cliente atual(apenas para uso local)
  

    constructor(props) {
        super(props)
        
        this.state = {            
            
        }
    }





    //atualiza(reseta) o state baseado no props assim que o componente pai atualiza    
    componentWillReceiveProps({visible, gameWSEndpoint, user}) {  
      if(!visible && !this.state.visible) return   //evita multiplas chamadas dessa função      
      
      this.#user = user;

      this.setState({
        ...this.state, 
        visible,        

        dataMatrix: undefined,            
        clues: undefined,

        highlightedWords: [],
        lockedWords: [],
        solvedWords: [],        

        players: [],       
        
      }, () => this.startGame(gameWSEndpoint)) 
    }
    //faz as chamadas para dar inicio ao jogo
    startGame = async (gameWSEndpoint) => {
      console.log('opening game')

      this.#socketIOClient = undefined;
      this.#typedStringBuilt = '';
      this.#myself = undefined;

      this.websocketConnection(gameWSEndpoint)      
    }
    //fecha drawer do jogo, disconecta o ws e apaga sua referência
    closeGame(){
      console.log('closing game')

      this.#socketIOClient && this.#socketIOClient.disconnect();
      this.#socketIOClient = undefined;
      this.#typedStringBuilt = '';
      this.#myself = undefined;      

      this.setState({ 
        visible: false,        
      }, () => this.props.selfClose() )
    }





    //inicia a conexão websocket para recebimento dos dados e atualizações da partida
    websocketConnection = (gameWSEndpoint) => {      
      const socketIOClient = io(gameWSEndpoint, {transports: ['websocket'], upgrade: false})  
      

      
      socketIOClient.on('connect', () => {        
        this.#socketIOClient = socketIOClient
        const userPlayer = {
          id: this.#user._id,
          nickName: this.#user.nickName
        }        
        socketIOClient.emit('connectPlayer', userPlayer)
        console.log('game ws connected')
      }); 

      socketIOClient.on('disconnect', () => {        
        console.log('game ws disconnected')
      });
      
      socketIOClient.on('dataMatrix', (dataMatrix) => { this.updateAllMatchMatrix(dataMatrix) })

      socketIOClient.on('clues', (clues) => { this.updateAllClues(clues) })

      socketIOClient.on('lockedWords', (lockedWords) => { this.updateAllLockedWords(lockedWords) })

      socketIOClient.on('solvedWords', (solvedWords) => { this.updateAllSolvedWords(solvedWords) })

      socketIOClient.on('players', (players) => { this.updateAllPlayers(players) })

      socketIOClient.on('player', (player) => { this.setMyselfPlayerObject(player) })

      socketIOClient.on('errorMessage', (errorMessage) => {
        message.error(errorMessage)
        console.log(errorMessage)
      })
    }

    

    //altera os dados de um jogador(a cada atualização do score)
    updatePlayer(player){
      //
    }
    //alteração de cada posição da matriz de letras(a cada modificação de um jogador)
    updateMatchMatrix(modification){
      //
    }
    //alteração dos dados das listas de dicas(a cada atualização de alguma resolvida)
    updateClue(clueUpdate){
      //
    }

    //atualiza todos os dados dos jogadores(a cada atualização do score)
    updateAllPlayers(players){
      this.setState({ players: players });
    }    
    //atualiza toda a matriz de letras(a cada modificação de um jogador)
    updateAllMatchMatrix(dataMatrix){      
      this.setState({ dataMatrix: dataMatrix });
    }    
    //atualiza todos os dados das listas de dicas(a cada atualização de alguma resolvida)
    updateAllClues(clues){
      this.setState({ 
        clues: clues 
      });      
    }    
    //atualiza toda a lista de palavras travadas pelos jogadores
    updateAllLockedWords(lockedWords){  
      //const lockedMyself = this.state.myself && lockedWords.map((word) => word.player.id).includes(this.state.myself.id)
      if(this.#myself){        
        this.#myself.locked = lockedWords.find((word) => word.player.id === this.#myself.id)
        if(!this.#myself.locked) this.#typedStringBuilt = ''
      }
      
      this.setState({ 
        lockedWords: lockedWords,           
      }, () => { 
        this.updateAllHighlightedWords(this.state.lockedWords) 
      })
    }
    //atualiza todas as palavras destacadas ao receber a lista de palavras travadas(atualização apenas local?)
    updateAllHighlightedWords(highlightedWords){
      //dessa forma ao atualizar se retira destaque da palavra sob o evento hover do mouse(consertar?)
      this.setState({
        highlightedWords: highlightedWords
      })
    }
    //atualiza todas as palavras resolvidas
    updateAllSolvedWords(solvedWords){
      this.setState({ 
        solvedWords: solvedWords 
      })
    }

    //recupera objeto que representa o cliente atual do jogo
    setMyselfPlayerObject(player){
      this.#myself = player
      this.#myself.locked = this.state.lockedWords.find((word) => word.player.id === this.#myself.id)
    }



    //faz requisição ao socket para travar a palavra
    requestWordLock(wordToLock){
      if(!this.#socketIOClient) return;
      this.#socketIOClient.emit('lockWord', wordToLock)
    }    
    //envia as teclas pressionadas do teclado caso cliente tenha travado uma palavra(não detecta algumas teclas como o backspace[feature?])
    readEntry(event){
      if(!this.#myself) return;
      if(!this.#socketIOClient) return;

      const element = event.key.toUpperCase()
      const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
      if(!isLetter) return;
      
      if(this.#myself.locked){
        this.#typedStringBuilt += element;
        const update = {
          word: this.#myself.locked,
          entry: this.#typedStringBuilt,
        } 
        this.#socketIOClient.emit('updateMatrix', update)
      }      
    }
    


    isWordSolved(word){
      for(let solvedWord of this.state.solvedWords){    //checa se esta na lista de palavras resolvidas
        if(solvedWord.number === word.number && solvedWord.profile === word.profile) return true;
      }
      return false;
    }
    isWordLocked(word){
      for(let lockedWord of this.state.lockedWords){    //checa se esta na lista de palavras travadas
        if(lockedWord.number === word.number && lockedWord.profile === word.profile) return true;
      }
      return false;      
    }
    isWordHighlighted(word){
      for(let highlightedWord of this.state.highlightedWords){    //checa se esta na lista de palavras travadas
        if(highlightedWord.number === word.number && highlightedWord.profile === word.profile) return true;
      }
      return false;      
    }

    //verifica se palavra esta disponivel para se realizar ações de lock e hover sobre ela
    isWordAvailable(word){      
      if(!this.#myself) return false;
      if(this.#myself.locked) return false;
      if(this.isWordSolved(word)) return false;
      if(this.isWordLocked(word)) return false;
      
      return true;
    }

    //ao evento de mouseOver adiciona a palavra à lista de palavras destacadas
    highlightWord(word){
      const updatedHighlighted = [...this.state.highlightedWords, word]      
      this.setState({
        highlightedWords: updatedHighlighted
      })      
    }

    //ao evento de mouseOut remove a palavra da lista de palavras destacadas
    restoreHighlightedWord(word){
      const updatedHighlighted = this.state.highlightedWords.filter((highlightedWord) => 
          highlightedWord.number !== word.number || highlightedWord.profile !== word.profile
      ) 
      this.setState({
        highlightedWords: updatedHighlighted
      })                      
    }





    //constrói o componente matriz de palavras
    buildWordsMatrix(){      
      let matrixSize = window.innerWidth < window.innerHeight ? window.innerWidth*0.9 : window.innerHeight*0.9 
      matrixSize = Math.floor(matrixSize) + Math.floor(matrixSize)%this.state.dataMatrix.length + 1      
      const top = window.innerWidth < window.innerHeight ? 50 : window.innerHeight*0.05
      const left = window.innerWidth < window.innerHeight ? window.innerWidth*0.025 : window.innerWidth*0.15
      const letterFieldsMatrix = this.state.dataMatrix.map((row, rowIndex) => {
              return row.map((element, colIndex) => {
                return this.buildLetterField(rowIndex, colIndex, matrixSize/row.length)
              })
            })          
      //letterFieldsMatrix[0][0].props.style.borderColor = 'red' 

      return (
        <div id="gameMatrix" 
          style={{
                  width: matrixSize, height: matrixSize, 
                  position: 'absolute', left: left, top: top,
                }}
        >
          {            
            this.state.dataMatrix && letterFieldsMatrix 
          }
        </div>
      )
    }

    //constrói o componente campo da letra, chamado diversas vezes por buildWordsMatrix
    buildLetterField(rowIndex, colIndex, fieldSize){
      const item = this.state.dataMatrix[rowIndex][colIndex]    
      let element = item.element
      const isLetter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
      const elementClue = item.clueNumber
      
      let isHighlighted = false;
      let letterBackground = {R: 255, G: 255, B: 255};  //cor celula normal, alterado se celula for destacada
      if(!isLetter && element !== null){                //cor dos blocos de separação
        letterBackground = {R: 0, G: 0, B: 0};
      }else{
        if(this.state.highlightedWords.length > 0)
        for(let highlightedWord of this.state.highlightedWords){
          const belongsToHighlightedDown = item.downWord === highlightedWord.number && highlightedWord.profile === 'down';
          const belongsToHighlightedAcross = item.acrossWord === highlightedWord.number && highlightedWord.profile === 'across';
          if(belongsToHighlightedDown || belongsToHighlightedAcross){
            isHighlighted = true;            
            letterBackground = {
              R: letterBackground.R + highlightedWord.player.color.R,
              G: letterBackground.G + highlightedWord.player.color.G, 
              B: letterBackground.B + highlightedWord.player.color.B,
            };                     
          }
        }        
        if(isHighlighted){    //correção para remover o rgb do branco inicial caso a celula possua cor de destaque
          letterBackground = {
            R: letterBackground.R - 255,
            G: letterBackground.G - 255, 
            B: letterBackground.B - 255,
          };
        }        
        letterBackground = {      //correção para evitar q o limite do valor do rgb seja ultrapassado
          R: letterBackground.R > 255 ? letterBackground.R - 255 : letterBackground.R,
          G: letterBackground.G > 255 ? letterBackground.G - 255 : letterBackground.G,
          B: letterBackground.B > 255 ? letterBackground.B - 255 : letterBackground.B
        };
        if(isHighlighted &&letterBackground.R > 250 && letterBackground.G > 250 && letterBackground.B > 250){
          letterBackground = {      //correção para celulas resultando em cor branca
            R: letterBackground.R - 100,
            G: letterBackground.G - 100, 
            B: letterBackground.B - 100,
          };
        }
      }          
      const fieldBackground = `rgba(${letterBackground.R}, ${letterBackground.G}, ${letterBackground.B}, 1)`
      
      const fieldAcrossWord = { number: item.acrossWord, profile: 'across'}
      const fieldDownWord = { number: item.downWord, profile: 'down'}
      const isFieldSolved = this.isWordSolved(fieldAcrossWord) || this.isWordSolved(fieldDownWord)
      let fieldForeground = '#ddd';
      if(isFieldSolved){
        fieldForeground = '#000';
      }
      if(isHighlighted){
        fieldForeground = '#fff';
      }

      const letter = isLetter && 
              (<span 
                style={{
                  fontSize: Math.floor(fieldSize/2) + 1, fontWeight: 'bold', color: fieldForeground,
                  zIndex: -1,
                }}
              >
                {element}
              </span>)
      const clue = elementClue !== 0 &&
              (<span 
                style={{
                  fontSize: Math.floor(fieldSize/4), fontWeight: 'normal', color: isHighlighted ? '#fff' : '#000',
                  position: 'absolute', left: 0, top: 0,
                }}
              >
                {elementClue}
              </span>)
            

      return (
        <div id="letterField" 
          style={{
                  width: fieldSize, height: fieldSize, 
                  position: 'absolute', left: colIndex*fieldSize, top: rowIndex*fieldSize,
                  textAlign: 'center', display: 'block', alignItems: 'center' , marginTop: 0, marginLeft: 0, 
                  borderStyle: 'solid', borderColor: '#0f0f0f', borderWidth: 1,
                  backgroundColor: fieldBackground
                }}
        >
          {letter}
          {clue}        
          <div id={`fieldTopSide[${rowIndex}][${colIndex}]`} 
              style={{
                position: 'absolute', left: 0, top: 0, 
                width: '100%', height: '50%',
                //backgroundColor: '#00ff00'
              }}
              onMouseOver={() => {
                const word = {profile: 'down', number: item.downWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.highlightWord(word);
              }}
              onMouseOut={() => {
                const word = {profile: 'down', number: item.downWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.restoreHighlightedWord(word)
              }}
              onClick={() => {                
                const word = {profile: 'down', number: item.downWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.requestWordLock(word)
              }}
          />
          <div id={`fieldBottomSide[${rowIndex}][${colIndex}]`} 
              style={{
                position: 'absolute', left: 0, top: '50%', 
                width: '100%', height: '50%',
                //backgroundColor: '#ff0000'
              }}
              onMouseOver={() => {
                const word = {profile: 'across', number: item.acrossWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.highlightWord(word);
              }}
              onMouseOut={() => {
                const word = {profile: 'across', number: item.acrossWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.restoreHighlightedWord(word)
              }}
              onClick={() => {
                const word = {profile: 'across', number: item.acrossWord, player: this.#myself}
                if(!this.isWordAvailable(word)) return;                
                this.requestWordLock(word)
              }}
          />
        </div>
      )
    }



    //constrói o componente placar 
    buildScoreList(){
      let matrixSize = window.innerWidth < window.innerHeight ? window.innerWidth*0.9 : window.innerHeight*0.9 
      matrixSize = Math.floor(matrixSize) + Math.floor(matrixSize)%this.state.dataMatrix.length + 1      
      const listWidth = window.innerWidth < window.innerHeight ? window.innerWidth*0.93 : window.innerWidth*0.13
      const listHeight = matrixSize
      const top = window.innerWidth < window.innerHeight ? matrixSize + listHeight + 50 + 20 : window.innerHeight*0.05
      const left = window.innerWidth < window.innerHeight ? window.innerWidth*0.025 : window.innerWidth*0.005
      
      return (
        <div id="scoreList" 
          style={{
                  width: listWidth, height: listHeight, 
                  position: 'absolute', left: left, top: top,
                  display: 'flex',
                  //marginTop: marginTop, marginLeft: marginLeft,
                  borderStyle: 'solid', borderColor: '#ddd', borderWidth: 1,
                  overflowX: 'hidden', overflowY: 'scroll'
                }}
        >
          <List
            itemLayout="horizontal"
            dataSource={ this.state.players }
            renderItem={item => (
              <List.Item>
                <div 
                  style={{
                    width: listWidth*0.8,
                    backgroundColor: `rgba(${item.color.R}, ${item.color.G}, ${item.color.B}, 0.5)`, //color: `rgba(${item.color.R}, ${item.color.G}, ${item.color.B}, 1)`,
                    borderStyle: 'solid', borderWidth: '3', borderColor: `rgba(${item.color.R}, ${item.color.G}, ${item.color.B}, 1)`
                  }}
                >
                  <List.Item.Meta                  
                    avatar={
                      item.connected ? 
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" /> :
                      <LoadingOutlined style={{fontSize: 30, marginLeft: 10}}/>
                    }
                    title={item.nickName}
                    description={`score: ${item.score}`}
                  />
                </div>
              </List.Item>
            )}
          />
        </div>
      )
    }

    //constrói o componente lista de dicas
    buildClues(){
      let matrixSize = window.innerWidth < window.innerHeight ? window.innerWidth*0.9 : window.innerHeight*0.9 
      matrixSize = Math.floor(matrixSize) + Math.floor(matrixSize)%this.state.dataMatrix.length + 1      
      const listWidth = window.innerWidth < window.innerHeight ? window.innerWidth*0.93 : window.innerWidth*0.8 - matrixSize
      const listHeight = matrixSize*0.9
      const top = window.innerWidth < window.innerHeight ? matrixSize + 50 + 50 : window.innerHeight*0.1
      const left = window.innerWidth < window.innerHeight ? window.innerWidth*0.025 : window.innerWidth*0.15 + matrixSize + 50
      
      return (
        <div id="cluesList" 
          style={{
                  width: listWidth, height: listHeight, 
                  position: 'absolute', left: left, top: top,
                  display: 'flex',
                  //marginTop: marginTop, marginLeft: marginLeft,
                  //borderStyle: 'solid', borderColor: '#00ff00', borderWidth: 2
                }}
        >
          <div id="cluesDownHeader" style={{position: 'absolute', top: -40, left: 0}}>
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Down Clues</span>
            <ArrowDownOutlined style={{fontSize: 30, marginLeft: 10}}/>
          </div>
          <div id="cluesDown" 
              style={{
                width: '50%', 
                textAlign: 'center', overflowY: 'scroll',/*, direction: 'rtl'*/
                //borderStyle: 'solid', borderWidth: 3, borderColor: '#ff5511'
              }}>            
            <List
              size="small"                   
              bordered
              dataSource={ this.state.clues.down }
              renderItem={(item) => {                              
                const currentClueWord = {
                  number: item.number,
                  profile: 'down'
                }  
                let clueColor = {R:255, G:255, B:255}                
                if(this.isWordHighlighted(currentClueWord)){
                  const clueHighlightedWord = this.state.highlightedWords.find((highlightedWord) => highlightedWord.number === item.number && highlightedWord.profile === 'down')
                  clueColor = clueHighlightedWord.player.color                                   
                }      
                //procura item das dicas para verificar se está na lista de palavras resolvidas                              
                if(this.isWordSolved(currentClueWord)){
                  clueColor = {R:100, G:100, B:100}
                }
                  
                return (
                  <List.Item>
                    <div 
                      style={{                        
                        backgroundColor: `rgba(${clueColor.R}, ${clueColor.G}, ${clueColor.B}, 0.5)`, 
                        borderStyle: 'solid', borderWidth: '3', borderColor: `rgba(${clueColor.R}, ${clueColor.G}, ${clueColor.B}, 1)`
                      }}
                      onMouseOver={() => {
                        const word = {profile: 'down', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.highlightWord(word);
                      }}
                      onMouseOut={() => {
                        const word = {profile: 'down', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.restoreHighlightedWord(word)
                      }}
                      onClick={() => {
                        const word = {profile: 'down', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.requestWordLock(word)
                      }}
                    >
                      {item.description}
                    </div>
                  </List.Item>
                )
              }}
              style={{marginTop: 10}}                          
            />
          </div>
          <div id="cluesAcrossHeader" style={{position: 'absolute', top: -40, left: "50%"}}>
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Across Clues</span>
            <ArrowRightOutlined style={{fontSize: 30, marginLeft: 10}}/>
          </div>
          <div id="cluesAcross" 
              style={{
                width: '50%', 
                textAlign: 'center', overflowY: 'scroll',
                //borderStyle: 'solid', borderWidth: 3, borderColor: '#ff5511'
              }}>            
            <List
              size="small"                   
              bordered
              dataSource={ this.state.clues.across }
              renderItem={(item) => {
                const currentClueWord = {
                  number: item.number,
                  profile: 'across'
                }  
                let clueColor = {R:255, G:255, B:255}                
                if(this.isWordHighlighted(currentClueWord)){
                  const clueHighlightedWord = this.state.highlightedWords.find((highlightedWord) => highlightedWord.number === item.number && highlightedWord.profile === 'across')
                  clueColor = clueHighlightedWord.player.color                                   
                }      
                //procura item das dicas para verificar se está na lista de palavras resolvidas                              
                if(this.isWordSolved(currentClueWord)){
                  clueColor = {R:100, G:100, B:100}
                }
                return (
                  <List.Item>
                    <div 
                      style={{
                        width: '100%', height: '100%',                       
                        backgroundColor: `rgba(${clueColor.R}, ${clueColor.G}, ${clueColor.B}, 0.5)`, 
                        borderStyle: 'solid', borderWidth: '3', borderColor: `rgba(${clueColor.R}, ${clueColor.G}, ${clueColor.B}, 1)`
                      }}
                      onMouseOver={() => {
                        const word = {profile: 'across', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.highlightWord(word);
                      }}
                      onMouseOut={() => {
                        const word = {profile: 'across', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.restoreHighlightedWord(word)
                      }}
                      onClick={() => {
                        const word = {profile: 'across', number: item.number, player: this.#myself}
                        if(!this.isWordAvailable(word)) return;                
                        this.requestWordLock(word)
                      }}
                    >
                      {item.description}
                    </div>
                  </List.Item>
                )
              }}
              style={{marginTop: 10}}                                     
            />
          </div>
        </div>
        
      )
    }  



    //chamada para construção de todos os componentes do jogo
    buildGameScreen(){
      return (
        <div id="gameScreen" 
            style={{
                    width: window.innerWidth, height: window.innerHeight, 
                    position: 'absolute', left: '0', top: '0',
                    //borderStyle: 'solid', borderColor: '#ff0000', borderWidth: 2
                  }}
        >
          {this.state.dataMatrix &&this.buildWordsMatrix()}
          {this.state.clues && this.buildClues()}
          {this.state.players && this.buildScoreList()}

        </div>
      )
    }

    
    


    render() {

        const drawerGame = (
            <Drawer
                //title="Game"
                placement="bottom"
                closable={true}
                height={"100%"}
                onClose={() => this.closeGame()}
                visible={this.state.visible}
                onKeyPress={(event) => this.readEntry(event)}
            >
                {this.state.dataMatrix && this.buildGameScreen()}                
            </Drawer>
        )

        return (
            <div id="drawerStore">
                {drawerGame}                
            </div>
        )
    }
}