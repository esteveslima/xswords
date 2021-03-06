import React, { Component } from 'react'
import { Drawer, message } from 'antd';
import { HourglassTwoTone } from '@ant-design/icons';
import './queue.css'
import { QUEUE_SERVER } from '../../config/urls'
import io from "socket.io-client";

export default class Queue extends Component {
    #authToken = undefined;
    #user = undefined;
    #socketIOClient = undefined;
    constructor(props) {
        super(props)

        this.state = {            

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({visible, user, authToken}) {   
        if(!visible && !this.state.visible) return       //evita multiplas chamadas dessa função             
        
        this.#authToken = authToken;
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
                    'Authorization' : `Bearer ${this.#authToken}`,
                    'Content-Type': 'application/json',
                }            
            })
            
                     
            if(response.status === 200){
                var json = await response.json()
                const queue = {
                    path: json.path,
                    nameSpace: json.nameSpace
                }                
                this.websocketQueue(queue)
            }else{
                message.error('Failed to join queue, try again');
                this.leaveQueue();
            }
        }catch(e){
            message.error('Queue server not responding, try again later');
            this.leaveQueue();
        }
        
    }

    websocketQueue = (queue) => {      
        console.log(queue)  
        const queueEndpoint = `http://${process.env.REACT_APP_QUEUE_HOST}:${process.env.REACT_APP_QUEUE_PORT}/${queue.nameSpace}`
        const socketIOClient = io(queueEndpoint, {
            path: `/${queue.path}`,
            transports: ['websocket'],
            upgrade: false
        })
        
        socketIOClient.on('connect', () => {
            this.#socketIOClient = socketIOClient
            const myselfId = this.#user._id
            socketIOClient.emit('connectPlayer', myselfId)
            console.log('queue ws connected')
        });
        socketIOClient.on('disconnect', () => {        
            console.log('queue ws disconnected')
        });
        socketIOClient.on('match', (gameMatch) => {            
            this.props.onFinish(gameMatch)
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