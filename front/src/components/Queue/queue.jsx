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

        //simulando a requisição q o server queue faz para pedir a geração de uma partida
        const response = await fetch(`${QUEUE_SERVER}/generateMatch`, {
            method: "GET",
            headers: {              
              'Content-Type': 'application/json'
            }            
        })             
        this.leaveQueue()           
        var json = await response.json()        
        if (json.status) {            
           this.props.onFinish(json.endPoint)
        } else {                        
            console.log('error:' + json.error)
        }

        //requisição para se conectar à queue(retorna erro ou endpoint do ws da queue)
        //ws da fila da queue(retorna erro ou endpoint do ws do game)

        /*setTimeout(() => {
            this.leaveQueue()
            const gameWSEndpoint = "http://127.0.0.1:7000/matches";
            this.props.onFinish(gameWSEndpoint)
        }, 1000); */
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