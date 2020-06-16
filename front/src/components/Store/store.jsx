import React, { Component } from 'react'
import { Modal, Button, Input, Drawer } from 'antd';
import { ShopTwoTone } from '@ant-design/icons';
import './store.css'

export default class Store extends Component {

    constructor(props) {
        super(props)

        this.state = {
            items: undefined,

            visible: this.props.visible,
        }

    }

    componentWillReceiveProps({visible}) {
      this.setState({...this.state, visible})
    }


    render() {

        const drawerStore = (
            <Drawer
                title="Store"
                placement="left"
                closable={true}
                width="300"
                onClose={() => this.setState({ visible: false }, () => this.props.selfClose() )}
                visible={this.state.visible}
            >
                <p>Items...</p>
                <p>Items...</p>
                <p>Items...</p>
            </Drawer>
        )

        return (
            <div id="drawerStore">
                {drawerStore}                
            </div>
        )
    }
}