import Login from '../Login/login'
import Store from '../Store/store'
import Queue from '../Queue/queue'
import Game from '../Game/game'

import React, { Component } from 'react'
import { ShopTwoTone } from '@ant-design/icons';
import './home.css'
import jwt from 'jwt-decode'
import { USER_SERVER } from '../../config/urls'


export default class Home extends Component {

    #gameWSEndpoint = undefined;

    constructor(props) {
        super(props)        

        this.state = {
            user: undefined,
            gameVisible: false,
            storeVisible: false,
            queueVisible: false,
                        
        }

    }

    setUser = async (userToken) => {
        const decodedToken = jwt(userToken).id;
        
        const response = await fetch(`${USER_SERVER}/api/user/${decodedToken}`, {
            method: "GET",
            headers: {              
              'Content-Type': 'application/json'
            }            
        })
        var json = await response.json()
        if(json.status){
            const user = json.user
            this.setState({user: user})
        }        
    }



    render() {

        const loginView = (
            <Login onSuccess={(userToken) => this.setUser(userToken) } />
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
                <ShopTwoTone twoToneColor="#f30" style={{ fontSize: '75px' }} />
            </div>
        )        

        const buttonPlay = (
            <div className="buttonPlay" onClick={() => this.setState({ queueVisible: true })}>
                <span className="buttonPlayWord">Play</span>
            </div>
        )

        const userInfo = this.state.user && (
            <div className="userInfo" style={{display: 'block'}}>
                <p><span style={{fontSize: 25, color: 'rgb(216, 68, 9)', fontWeight: 'bold'}}>{`Welcome ${this.state.user.nickName}`}</span></p>
                <p><span style={{fontSize: 25, color: 'rgb(216, 68, 9)', fontWeight: 'bold'}}>{`your total score is ${this.state.user.score}`}</span></p>
            </div>
        ) 
        
        

        const homeView = (
            <div className="homeView">
                {userInfo}
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
                    this.state.user ? homeView : loginView
                }                
            </div>
        )
    }
}