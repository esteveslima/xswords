import React, { Component } from 'react'
import { Drawer, message } from 'antd';
import { HourglassTwoTone } from '@ant-design/icons';
import './queue.css'
import { QUEUE_SERVER } from '../../config/urls'
import io from "socket.io-client";

export default class Queue extends Component {

    #user = undefined;
    #socketIOClient = undefined;
    constructor(props) {
        super(props)

        this.state = {            

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({visible, user}) {   
        if(!visible && !this.state.visible) return       //evita multiplas chamadas dessa função             
        
        this.#user = user;
        
        this.setState({
          ...this.state, 
          visible
        }, () => this.state.visible && this.connectToQueue())
    }

    connectToQueue = async () => {
        console.log('joining queue')
        this.#socketIOClient = undefined
        //1- requisição para se conectar à queue(retorna erro ou endpoint do ws da queue)
        //2- ws da fila da queue(retorna erro ou namespace do ws do game)

        try{
            const response = await fetch(`${QUEUE_SERVER}/queue`, {
                method: "GET",
                timeout: 5000,
                headers: {              
                'Content-Type': 'application/json'
                }            
            })
            
            var json = await response.json()            
            if(json.status){
                const queueEndpoint = `${QUEUE_SERVER}/${json.nameSpace}`
                this.websocketQueue(queueEndpoint)
            }else{
                message.error('Failed to join queue, try again');
                this.leaveQueue();
            }
        }catch(e){
            message.error('Queue server not responding, try again later');
            this.leaveQueue();
        }
        
    }

    websocketQueue = (queueEndpoint) => {
        const socketIOClient = io(queueEndpoint, {transports: ['websocket'], upgrade: false})

        socketIOClient.on('connect', () => {
            this.#socketIOClient = socketIOClient
            const myselfId = this.#user._id
            socketIOClient.emit('connectPlayer', myselfId)
            console.log('queue ws connected')
        });
        socketIOClient.on('disconnect', () => {        
            console.log('queue ws disconnected')
        });
        socketIOClient.on('match', (gameWSEndpoint) => {
            this.props.onFinish(gameWSEndpoint)
            this.leaveQueue();
        })
    }

    leaveQueue(){
        console.log('leaving queue')

        this.#socketIOClient && this.#socketIOClient.disconnect();
        this.#socketIOClient = undefined;
        this.#user = undefined;
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