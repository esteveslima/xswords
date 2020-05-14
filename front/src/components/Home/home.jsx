import Login from '../Login/login'

import React, { Component } from 'react'
import { Modal, Button, Input, Drawer } from 'antd';
import { ShopTwoTone } from '@ant-design/icons';
import './home.css'

export default class Home extends Component {

    constructor(props) {
        super(props)

        this.state = {
            user: undefined,

            storeVisible: false,
        }

    }

    setUser(userToken) {
        this.setState({ user: userToken })
        console.log(userToken)
    }


    render() {

        const loginView = (
            <Login onSuccess={this.setUser.bind(this)} />
        )

        const buttonPlay = (
            <div className="buttonPlay">
                <span className="buttonPlayWord">Jogar</span>
            </div>
        )

        const buttonStore = (
            <div className="buttonStore" onClick={() => this.setState({ storeVisible: true })}>
                <ShopTwoTone twoToneColor="#f00" style={{ fontSize: '75px' }} />
            </div>
        )

        const drawerStore = (
            <Drawer
                title="Loja"
                placement="left"
                closable={false}
                width="300"
                onClose={() => this.setState({ storeVisible: false })}
                visible={this.state.storeVisible}
            >
                <p>Itens Loja...</p>
                <p>Itens Loja...</p>
                <p>Itens Loja...</p>
            </Drawer>
        )

        const homeView = (
            <div className="homeView">
                {buttonPlay}
                {buttonStore}
                {drawerStore}
            </div>
        )

        return (
            <div id="homePage">
                <img
                    style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.1, zIndex: -1 }}
                    src="https://si.wsj.net/public/resources/images/OG-CO816_201904_G_20190422123727.gif"
                />
                {
                    (!this.state.user) ? loginView :
                        (homeView)
                }
            </div>
        )
    }
}