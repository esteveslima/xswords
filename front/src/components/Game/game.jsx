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

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({matchData, visible}) {
      this.setState({
        ...this.state, 
        visible,
      }, () => matchData && this.organizeMatchData(matchData)) 
    }    



    organizeMatchData = (matchData) => {
      console.log(matchData.date)
      this.generateDataMatrix(matchData)
      this.setState({
        cluesDownList: matchData.clues.down,
        cluesAcrossList: matchData.clues.across
      })
    }
    
    generateDataMatrix = (matchData) => {
      if(matchData.size.rows !== matchData.size.cols) this.props.selfClose()
      
      const gridMatrix = new Array(matchData.size.rows)
      for(let line = 0; line < matchData.size.rows; line++){
        gridMatrix[line] = new Array(matchData.size.cols)
        for(let col = 0; col < matchData.size.cols; col++){
          gridMatrix[line][col] = {
            element: matchData.grid[line*matchData.size.cols + col],
            clueNumber: matchData.gridnums[line*matchData.size.cols + col]
          }             
        }        
      }
      
      this.setState({dataMatrix: gridMatrix})
    }



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

    buildWordsMatrix(){      
      let matrixSize = window.innerWidth < window.innerHeight ? window.innerWidth*0.9 : window.innerHeight*0.9 
      matrixSize = Math.floor(matrixSize) + Math.floor(matrixSize)%this.state.dataMatrix.length + 1      
      const top = window.innerWidth < window.innerHeight ? 50 : window.innerHeight*0.05
      const left = window.innerWidth < window.innerHeight ? window.innerWidth*0.025 : window.innerHeight*0.3
      return (
        <div id="gameMatrix" 
          style={{
                  width: matrixSize, height: matrixSize, 
                  position: 'absolute', left: left, top: top,
                  //marginTop: marginTop, marginLeft: marginLeft,
                  //borderStyle: 'solid', borderColor: '#0000ff', borderWidth: 2
                }}
        >
          {            
            this.state.dataMatrix && this.state.dataMatrix.map((row, rowIndex) => {
              return row.map((element, colIndex) => {
                return this.buildLetterField(rowIndex, colIndex, matrixSize/row.length)
              })
            })
          }
        </div>
      )
    }

    buildLetterField(rowIndex, colIndex, fieldSize){      
      const element = this.state.dataMatrix[rowIndex][colIndex].element
      const isletter = typeof element === "string" && element.length === 1 && (element >= "a" && element <= "z" || element >= "A" && element <= "Z");
      const elementClue = this.state.dataMatrix[rowIndex][colIndex].clueNumber
      return (
        <div id="matrixField" 
          style={{
                  width: fieldSize, height: fieldSize, 
                  position: 'absolute', left: colIndex*fieldSize, top: rowIndex*fieldSize,
                  textAlign: 'center', display: 'block', alignItems: 'center' , marginTop: 0, marginLeft: 0, zIndex: -1,
                  borderStyle: 'solid', borderColor: '#0f0f0f', borderWidth: 1,
                  backgroundColor: isletter ? null : '#000000'
                }}
        >
          {
            (
              elementClue !== 0 &&
              <span 
                style={{
                  fontSize: Math.floor(fieldSize/4), fontWeight: 'normal', color: '#000000',
                  position: 'absolute', left: 0, top: 0,
                }}
              >
                {elementClue}
              </span>
            )
          }
          {  
            (
              isletter &&
              <span 
                style={{
                  fontSize: Math.floor(fieldSize/2) + 1, fontWeight: 'bold', color: '#555555'
                }}
              >
                {element}
              </span>
            )
          }          
        </div>
      )
    }

    buildCluesList(){
      let matrixSize = window.innerWidth < window.innerHeight ? window.innerWidth*0.9 : window.innerHeight*0.9 
      matrixSize = Math.floor(matrixSize) + Math.floor(matrixSize)%this.state.dataMatrix.length + 1      
      const listWidth = window.innerWidth < window.innerHeight ? window.innerWidth*0.93 : window.innerWidth*0.8 - matrixSize
      const listHeight = matrixSize*0.9
      const top = window.innerWidth < window.innerHeight ? matrixSize + 50 + 20 : window.innerHeight*0.1
      const left = window.innerWidth < window.innerHeight ? window.innerWidth*0.025 : window.innerHeight*0.3 + matrixSize + 50
      
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
          <div id="cluesDown" style={{width: '50%', textAlign: 'center', overflowY: 'scroll'/*, direction: 'rtl'*/}}>
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Palavras para baixo</span>
            <ArrowDownOutlined style={{fontSize: 30}}/>
            <List
              size="small"                   
              bordered
              dataSource={this.state.cluesDownList}
              renderItem={item => <List.Item>{item}</List.Item>}
              style={{marginTop: 10}}                          
            />
          </div>
          <div id="cluesAcross" style={{width: '50%', textAlign: 'center', overflowY: 'scroll'}}>
            <span style={{color: '#ee4400', fontSize: 16, fontWeight: 'bold'}}>Palavras para o lado</span>
            <ArrowRightOutlined style={{fontSize: 30}}/>
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
          {this.buildCluesList()}
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