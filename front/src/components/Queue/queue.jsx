import React, { Component } from 'react'
import { Drawer } from 'antd';
import { HourglassTwoTone } from '@ant-design/icons';
import './queue.css'
import { QUEUE_SERVER } from '../../config/urls'

export default class Queue extends Component {

    constructor(props) {
        super(props)

        this.state = {            

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({visible}) {   
        if(!visible && !this.state.visible) return       //evita multiplas chamadas dessa função             
        this.setState({
          ...this.state, 
          visible
        }, () => this.state.visible && this.connectToQueue())
    }

    connectToQueue = async () => {
        console.log('joining queue')

        //1- requisição para se conectar à queue(retorna erro ou endpoint do ws da queue)
        //2- ws da fila da queue(retorna erro ou namespace do ws do game)

        //simulando a requisição q o server queue faz para pedir a geração de uma partida
        const response = await fetch(`http://localhost:5001/generateMatch`, {
            method: "GET",
            headers: {              
              'Content-Type': 'application/json'
            }            
        })             
        this.leaveQueue()           
        var json = await response.json()        
        if (json.status) {
            //simulando já o retorno do ws da queue com a url + namespace do gameService
            this.props.onFinish('http://127.0.0.1:5001/' + json.nameSpace)       //substituir pela url do gameService antes de retornar do queueService
        } else {                        
            console.log('error:' + json.error)
        }

        
    }

    leaveQueue(){
        console.log('leaving queue')

        //desconectar do ws da queue

        this.setState({ 
            visible: false 
        }, () => this.props.selfClose())
    }

    render() {

        const drawerQueue = (
            <Drawer
                title="Queue"
                placement="top"
                closable={true}
                height={200}
                onClose={() => this.leaveQueue()}
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