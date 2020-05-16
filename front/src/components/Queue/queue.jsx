import React, { Component } from 'react'
import { Drawer } from 'antd';
import { HourglassTwoTone } from '@ant-design/icons';
import './queue.css'

export default class Queue extends Component {

    constructor(props) {
        super(props)

        this.state = {            

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({visible}) {
        this.setState({
          ...this.state, 
          visible
        }, () => this.state.visible && this.generateMatchData())      
    }


    generateMatchData = async () => {
        const year = Math.floor(1976 + Math.random()*41)        //gera até 2016 apenas
        const month = ('0' + Math.floor(Math.random()*12 + 1)).slice(-2)
        const day = ('0' + Math.floor(Math.random()*28 + 1)).slice(-2)
        const response = await fetch(`https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${year}/${month}/${day}.json`, {
            method: "GET"        
        })                
        var json = await response.json()
        
        setTimeout(() => {
            this.props.selfClose()
            this.props.onFinish(json)
        }, 1000);            
    }

    render() {

        const drawerQueue = (
            <Drawer
                title="Queue"
                placement="top"
                closable={true}
                height={200}
                onClose={() => this.setState({ visible: false }, () => this.props.selfClose() )}
                visible={this.state.visible}
            >
                <p>Matchmaking...</p>
                <HourglassTwoTone style={{fontSize: 40}} twoToneColor="#947119" spin/>
            </Drawer>
        )

        return (
            <div id="drawerStore">
                {drawerQueue}                
            </div>
        )
    }
}