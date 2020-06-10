import Login from '../Login/login'
import Store from '../Store/store'
import Queue from '../Queue/queue'
import Game from '../Game/game'

import React, { Component } from 'react'
import { ShopTwoTone } from '@ant-design/icons';
import './home.css'


export default class Home extends Component {

    #gameWSEndpoint = undefined;

    constructor(props) {
        super(props)        

        this.state = {
            user: Date.now(),           //gerando um id aleatorio para testes, substituido pelo id do login
            gameVisible: false,
            storeVisible: false,
            queueVisible: false,
                        
        }

    }





    render() {

        const loginView = (
            <Login onSuccess={(userToken) => this.setState({ user: userToken })} />
        )

        const storeView = (
            <Store visible={this.state.storeVisible} user={this.state.user}
            selfClose={()=> this.setState({storeVisible: false})}/>
        )

        const queueView = (
            <Queue visible={this.state.queueVisible} user={this.state.user}
                selfClose={()=> this.setState({queueVisible: false})} 
                onFinish={(gameWSEndpoint) => {
                    this.#gameWSEndpoint = gameWSEndpoint                    
                    this.setState({
                        queueVisible: false, 
                        gameVisible: true,                         
                    })  
                    
                }}
            />
        )

        const gameView = (
            <Game visible={this.state.gameVisible} user={this.state.user} gameWSEndpoint={this.#gameWSEndpoint}
                selfClose={()=> this.setState({gameVisible: false})} 
            />
        )

        const buttonStore = (
            <div className="buttonStore" onClick={() => this.setState({ storeVisible: true })}>
                <ShopTwoTone twoToneColor="#f00" style={{ fontSize: '75px' }} />
            </div>
        )        

        const buttonPlay = (
            <div className="buttonPlay" onClick={() => this.setState({ queueVisible: true })}>
                <span className="buttonPlayWord">Jogar</span>
            </div>
        )    
        
        

        const homeView = (
            <div className="homeView">
                {buttonPlay}
                {buttonStore}
                {storeView}
                {queueView}
                {gameView}
            </div>
        )

        return (
            <div id="homePage">
                <img
                    style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.1, zIndex: -1 }}
                    src="https://si.wsj.net/public/resources/images/OG-CO816_201904_G_20190422123727.gif"
                />
                {
                    homeView//this.state.user ? homeView : loginView
                }                
            </div>
        )
    }
}