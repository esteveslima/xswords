import React, { Component } from 'react'
import { Drawer, List} from 'antd';
import { ArrowDownOutlined, ArrowRightOutlined} from '@ant-design/icons';
import './game.css'

export default class Game extends Component {

    constructor(props) {
        super(props)
          
        this.state = {  
            dataMatrix: undefined,            
            cluesDownList: undefined,
            cluesAcrossList: undefined,

            highlightedDownWords: [],
            highlightedAcrossWords: [],
            

            visible: this.props.visible,
        }

    }

    //atualiza o state baseado no props assim que o componente pai atualiza
    componentWillReceiveProps({matchData, visible}) {
      this.setState({
        ...this.state, 
        visible,
      }, () => matchData && this.organizeMatchData(matchData)) 
    }    

    //organiza os dados do json da partida
    organizeMatchData = (matchData) => {
      console.log(`crossword from ${matchData.publisher} at ${matchData.date}` )
      this.generateDataMatrix(matchData)
      this.setCluesLists(matchData)
    }

    //separa as lista de dicas
    setCluesLists = (matchData) => {
      this.setState({
        cluesDownList: matchData.clues.down,
        cluesAcrossList: matchData.clues.across
      })
    }
    
    //gera a matriz de dados
    generateDataMatrix = (matchData) => {
      if(matchData.size.rows !== matchData.size.cols) this.props.selfClose()
            
      const gridMatrix = new Array(matchData.size.rows)
      for(let line = 0; line < matchData.size.rows; line++){
        gridMatrix[line] = new Array(matchData.size.cols)        
        for(let col = 0; col < matchData.size.cols; col++){
          const element = matchData.grid[line*matchData.size.cols + col]
          const clueNumber = matchData.gridnums[line*matchData.size.cols + col]

          //separa as letras e numero das dicas
          gridMatrix[line][col] = {
            element: element,
            clueNumber: clueNumber,  
            acrossWord: undefined,
            downWord: undefined          
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



    //destaca palavra 'down'
    highLightDownWord(wordNumber){
      this.setState({
        highlightedDownWords: [...this.state.highlightedDownWords, wordNumber]
      })
    }
    //volta palavra destacada 'down' ao normal
    restoreDownWord(wordNumber){
      this.setState({
        highlightedDownWords: this.state.highlightedDownWords.filter((highlighted) => highlighted !== wordNumber)
      })            
    }
    //destaca palavra 'across'
    highLightAcrossWord(wordNumber){
      this.setState({
        highlightedAcrossWords: [...this.state.highlightedAcrossWords, wordNumber]
      })      
    }
    //volta palavra destacada 'across' ao normal
    restoreAcrossWord(wordNumber){
      this.setState({
        highlightedAcrossWords: this.state.highlightedAcrossWords.filter((highlighted) => highlighted !== wordNumber)
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

    //constrói o componente campo da letra
    buildLetterField(rowIndex, colIndex, fieldSize){
      const item = this.state.dataMatrix[rowIndex][colIndex]    
      const element = item.element
      const isletter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
      const elementClue = item.clueNumber

      const letter = isletter && 
              (<span 
                style={{
                  fontSize: Math.floor(fieldSize/2) + 1, fontWeight: 'bold', color: '#f0f0f0',
                  zIndex: -1,
                }}
              >
                {element}
              </span>)
      const clue = elementClue !== 0 &&
              (<span 
                style={{
                  fontSize: Math.floor(fieldSize/4), fontWeight: 'normal', color: '#000000',
                  position: 'absolute', left: 0, top: 0,
                }}
              >
                {elementClue}
              </span>)
      
      const checkHighlighted = (this.state.highlightedDownWords.includes(item.downWord) || this.state.highlightedAcrossWords.includes(item.acrossWord)) ?
                "#ff8708" : null

      return (
        <div id="letterField" 
          style={{
                  width: fieldSize, height: fieldSize, 
                  position: 'absolute', left: colIndex*fieldSize, top: rowIndex*fieldSize,
                  textAlign: 'center', display: 'block', alignItems: 'center' , marginTop: 0, marginLeft: 0, 
                  borderStyle: 'solid', borderColor: '#0f0f0f', borderWidth: 1,
                  backgroundColor: isletter ? checkHighlighted : '#000000'
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
              onMouseOver={() => this.highLightDownWord(item.downWord)}
              onMouseOut={() => this.restoreDownWord(item.downWord)}
          />
          <div id={`fieldBottomSide[${rowIndex}][${colIndex}]`} 
              style={{
                position: 'absolute', left: 0, top: '50%', 
                width: '100%', height: '50%',
                //backgroundColor: '#ff0000'
              }}
              onMouseOver={() => this.highLightAcrossWord(item.acrossWord)}
              onMouseOut={() => this.restoreAcrossWord(item.acrossWord)}
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