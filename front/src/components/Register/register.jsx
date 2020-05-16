import React, { Component } from 'react'
import { Modal, Button, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { USER_SERVER } from '../../config/urls'
import './register.css'


export default class Register extends Component {

    constructor(props) {
        super(props)

        this.state = {
            nickName: undefined,
            login: undefined,
            password: undefined,

            visible: this.props.visible,
            loading: false,
        }
    }

    componentWillReceiveProps({visible}) {
      this.setState({...this.state, visible})
    }

    register = async () => {
      this.setState({ loading: true })     
        
        const response = await fetch(`${USER_SERVER}/api/user/`, {
            method: "POST",
            headers: {
              //'access-token' : JSON.parse(sessionStorage.getItem('token')),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickName: this.state.nickName,
                login: this.state.login,
                password: this.state.password
            }),
            
        })                
        var json = await response.json()

        if (json.status) {            
           this.props.selfClose()    
        } else {            
            console.log('error:' + json.error)
        }

      this.setState({loading: false})
    }



    render() {

        const registerModal = (
            <Modal className="modalRegister"
                title="Register"
                width={310}                
                centered={true}
                visible={this.state.visible}
                closable={true}
                onCancel={() => {
                  this.setState({
                    nickName: undefined,
                    login: undefined,
                    password: undefined,

                    visible: false,
                    loading: false,
                  })
                }, () => this.props.selfClose() }
                footer={[
                    <div className="modalRegisterFooter" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button className="modalRegisterButtonRegister"
                            style={{ backgroundColor: '#fff', borderColor: '#333', color: '#333' }}
                            loading={this.state.loading}
                            onClick={() => this.register()}
                        >
                            Cadastrar
                        </Button>                        
                    </div>
                ]}
            >
                <div className="modalRegisterBody">
                    <Input size="large" placeholder="Nickname" prefix={<UserOutlined />}
                        value={this.state.nickName}
                        onChange={(value) => this.setState({ nickName: value.target.value })}
                    />
                    <Input size="large" placeholder="Usuário" prefix={<UserOutlined />}
                        value={this.state.login}
                        onChange={(value) => this.setState({ login: value.target.value })}
                    />
                    <Input.Password size="large" placeholder="Senha"
                        value={this.state.password}
                        onChange={(value) => this.setState({ password: value.target.value })}
                    />
                </div>
            </Modal>
        )

        return (
            <div id="modalRegister">
                {registerModal}
            </div>
        )
    }
}