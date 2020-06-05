import React, { Component } from 'react'
import { Drawer, List} from 'antd';
import { ArrowDownOutlined, ArrowRightOutlined} from '@ant-design/icons';
import './game.css'

export default class Game extends Component {

    constructor(props) {
        super(props)
          
        this.state = {  

        }
    }



    //separa as lista de dicas[server]
    initCluesLists = (matchData) => {
      this.setState({
        cluesDownList: matchData.clues.down,
        cluesAcrossList: matchData.clues.across
      })
    }
    
    //gera a matriz de dados[server]
    initDataMatrix = (matchData) => {
      if(matchData.size.rows !== matchData.size.cols) this.props.selfClose()  //server matchmaking
            
      const gridMatrix = new Array(matchData.size.rows)
      for(let line = 0; line < matchData.size.rows; line++){
        gridMatrix[line] = new Array(matchData.size.cols)        
        for(let col = 0; col < matchData.size.cols; col++){
          const element = matchData.grid[line*matchData.size.cols + col]
          const clueNumber = matchData.gridnums[line*matchData.size.cols + col]

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


      
      this.setState({dataMatrix: gridMatrix})
    }

    //verifica celula e trava[server]
    wordLock(word){
      for(let solvedWord of this.state.solvedWords){    //checa se esta na lista de palavras resolvidas
        if(solvedWord.number === word.number && solvedWord.profile === word.profile) return false;
      }
      for(let lockedWord of this.state.serverLockedWords){  //checa se esta na lista de palavras travadas
        if(lockedWord.number === word.number && lockedWord.profile === word.profile) return false;
      }
      this.setState({
        serverLockedWords: [...this.state.serverLockedWords, word]
      }, () => {
        
        //simulando para teste ja o retorno da lista de palavras bloqueadas tanto no momento q estao travadas, quanto no momento em que sao destravadas
        this.updateLockedWords(this.state.serverLockedWords)
        setTimeout(() => { 
          this.setState({            
            serverLockedWords: this.state.serverLockedWords.filter((lockedWord) => 
              lockedWord.number !== word.number || lockedWord.profile !== word.profile
            )
          }, () => this.updateLockedWords(this.state.serverLockedWords))
        }, 10000);   
        //  //  //  //  //  //  //  //  //  //   
      })

    }

    //atualiza o state baseado no props assim que o componente pai atualiza
    //faz o reset do state e inicia a conexão com o websocket
    componentWillReceiveProps({matchData, visible}) {      
      this.setState({
        ...this.state, 
        visible,
        dataMatrix: undefined,            
        cluesDownList: [],
        cluesAcrossList: [],

        highlightedWords: [],
        lockedWords: [],
        solvedWords: [],
        serverLockedWords: [],    // servidor[apagar]

        players: [],

        myself : undefined,
        lockedMyself: false,
        
      }, () => this.websocketConnection(matchData)) 
    }    
    //conexão websocket para recebimento dos dados e atualizações da partida
    websocketConnection(matchData){
      matchData && this.organizeMatchData(matchData) //remover e substituir pela conexao do websocket
    }
    //redireciona os dados às funções de acordo com a ação recebida
    dataRouter(){

    }

    //organiza os dados iniciais da partida[removivel ao se integrar o socket?]
    organizeMatchData = (matchData) => {
      console.log(`crossword from ${matchData.publisher} at ${matchData.date}` )
      this.initPlayers()
      this.initDataMatrix(matchData)
      this.initCluesLists(matchData)
    }

    //dados iniciais de cada jogador
    initPlayers(players){
      players = [                      
              {id: 1, score: 0, color: {R: 255, G: 0, B: 0}},
              {id: 2, score: 0, color: {R: 0, G: 255, B: 0}},
              {id: 3, score: 0, color: {R: 0, G: 0, B: 255}},          
      ]
      const myself = {id: 333, score: 0, color: {R: 255, G: 110, B: 0}}
      //setar myself procurando o proprio id
      this.setState({
        players: players,
        myself: myself,
      })
    }
    //altera os dados de um jogador(a cada atualização do score)
    updatePlayer(player){

    }
    //dados inicias para construção da matriz de letras
    initMatchGrid(match){

    }
    //alteração de cada posição da matriz de letras(a cada modificação de um jogador)
    updateMatchGrid(modification){

    }
    //dados das listas de dicas
    initCluesList(clues){

    }
    //alteração dos dados das listas de dicas(a cada atualização de alguma resolvida)
    updateCluesList(clueUpdate){

    }
    //atualização da lista de palavras selecionadas e travadas pelos jogadores
    updateLockedWords(lockedWords){          
      this.setState({ 
        lockedWords: lockedWords,
        lockedMyself: lockedWords.map((word) => word.player.id).includes(this.state.myself.id)
      }, () => this.updateHighlightedWords(this.state.lockedWords))
    }
    //atualização geral das palavras destacadas ao receber a lista de palavras selecionadas e travadas
    updateHighlightedWords(words){
      //dessa forma ao atualizar se retira destaque da palavra sob o evento hover do mouse(consertar?)
      this.setState({
        highlightedWords: words
      })
    }
    //atualização das palavras resolvidas
    updateSolvedWords(solvedWords){
      this.setState({ 
        solvedWords: solvedWords 
      })
    }



    //faz requisição ao socket para travar a palavra
    requestWordLock(wordToLock){      
      this.wordLock(wordToLock)   //envia pelo socket
      //[server part] se aprovado, deve retornar nova lista de palavras travadas com esta adicionada
 
      //se aprovado, habilitar digitação da palavra, se recusado exibir mensagem de erro
    }    
    //detecta a tecla pressionada no teclado
    readKeyboard(event){
      return event.key; 
    }
    
    


    //verifica se palavra esta disponivel para se realizar ações sobre ela
    isWordAvailable(word){
      for(let solvedWord of this.state.solvedWords){    //checa se esta na lista de palavras resolvidas
        if(solvedWord.number === word.number && solvedWord.profile === word.profile) return false;
      }
      for(let lockedWord of this.state.lockedWords){    //checa se esta na lista de palavras travadas
        if(lockedWord.number === word.number && lockedWord.profile === word.profile) return false;
      }
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
      const isletter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");            
      const elementClue = item.clueNumber
      
      let isHighlighted = false;
      let letterBackground = {R: 255, G: 255, B: 255};  //cor celula normal, alterado se celula for destacada
      if(!isletter && element !== null){                //cor dos blocos de separação
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
        if(isHighlighted){    //correção para remover o rgb do branco caso a celula possua cor de destaque
          letterBackground = {
            R: letterBackground.R - 255,
            G: letterBackground.G - 255, 
            B: letterBackground.B - 255,
          };
        }        
        letterBackground = {  //correção para evitar q o limite do valor do rgb seja ultrapassado
          R: letterBackground.R > 255 ? letterBackground.R - 255 : letterBackground.R,
          G: letterBackground.G > 255 ? letterBackground.G - 255 : letterBackground.G,
          B: letterBackground.B > 255 ? letterBackground.B - 255 : letterBackground.B
        };
      }          
      const fieldBackground = `rgba(${letterBackground.R}, ${letterBackground.G}, ${letterBackground.B}, 1)`
      
      const letter = isletter && 
              (<span 
                style={{
                  fontSize: Math.floor(fieldSize/2) + 1, fontWeight: 'bold', color: isHighlighted ? '#fff' : '#000',
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
                if(this.state.lockedMyself) return;
                const word = {profile: 'down', number: item.downWord, player: this.state.myself}
                if(!this.isWordAvailable(word)) return;                
                this.highlightWord(word);
              }}
              onMouseOut={() => {
                if(this.state.lockedMyself) return;
                const word = {profile: 'down', number: item.downWord, player: this.state.myself}
                if(!this.isWordAvailable(word)) return;                
                this.restoreHighlightedWord(word)
              }}
              onClick={() => {
                if(this.state.lockedMyself) return;
                const word = {profile: 'down', number: item.downWord, player: this.state.myself}
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
                if(this.state.lockedMyself) return;
                const word = {profile: 'across', number: item.acrossWord, player: this.state.myself}
                if(!this.isWordAvailable(word)) return;                
                this.highlightWord(word);
              }}
              onMouseOut={() => {
                if(this.state.lockedMyself) return;
                const word = {profile: 'across', number: item.acrossWord, player: this.state.myself}
                if(!this.isWordAvailable(word)) return;                
                this.restoreHighlightedWord(word)
              }}
              onClick={() => {
                if(this.state.lockedMyself) return;
                const word = {profile: 'across', number: item.acrossWord, player: this.state.myself}
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
      const listWidth = window.innerWidth < window.innerHeight ? window.innerWidth*0.93 : window.innerWidth*0.12
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
                  borderStyle: 'solid', borderColor: '#dddd00', borderWidth: 5
                }}
        >

        </div>
      )
    }

    //constrói o componente lista de dicas
    buildCluesLists(){
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
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Palavras para baixo</span>
            <ArrowDownOutlined style={{fontSize: 30}}/>
          </div>
          <div id="cluesDown" 
              style={{
                width: '50%', 
                textAlign: 'center', overflowY: 'scroll',/*, direction: 'rtl'*/
                borderStyle: 'solid', borderWidth: 3, borderColor: '#ff5511'
              }}>            
            <List
              size="small"                   
              bordered
              dataSource={this.state.cluesDownList}
              renderItem={item => <List.Item>{item}</List.Item>}
              style={{marginTop: 10}}                          
            />
          </div>
          <div id="cluesAcrossHeader" style={{position: 'absolute', top: -40, left: "50%"}}>
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Palavras para o lado</span>
            <ArrowRightOutlined style={{fontSize: 30}}/>
          </div>
          <div id="cluesAcross" 
              style={{
                width: '50%', 
                textAlign: 'center', overflowY: 'scroll',
                borderStyle: 'solid', borderWidth: 3, borderColor: '#ff5511'
              }}>            
            <List
              size="small"                   
              bordered
              dataSource={this.state.cluesAcrossList}
              renderItem={item => <List.Item>{item}</List.Item>} 
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
                    borderStyle: 'solid', borderColor: '#ff0000', borderWidth: 2
                  }}
        >
          {this.buildWordsMatrix()}
          {this.buildCluesLists()}
          {this.buildScoreList()}

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
                onClose={() => this.setState({ visible: false }, () => this.props.selfClose() )}
                visible={this.state.visible}
                onKeyPress={(event) => this.readKeyboard(event)}
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