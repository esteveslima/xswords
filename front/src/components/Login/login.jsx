import React, { Component } from 'react'
import { Modal, Button, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { USER_SERVER } from '../../config/urls'
import './login.css'
import Register from '../Register/register'


export default class Login extends Component {

    constructor(props) {
        super(props)

        this.state = {
            login: undefined,
            password: undefined,

            visible: true,
            loading: false,

            registerVisible: false,
        }
    }

    registrationSelfClose = () => {
        this.setState({registerVisible: false})
    }

    login = async () => {        
        this.setState({ loading: true })     
        
        const response = await fetch(`${USER_SERVER}/api/auth/login/`, {
            method: "POST",
            headers: {
              //'access-token' : JSON.parse(sessionStorage.getItem('token')),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({                
                login: this.state.login,
                password: this.state.password
            }),
            
        })                
        var json = await response.json()
        
        if (json.status) {      
            console.log(json.token)
            this.props.onSuccess(json.token)
            this.setState({ visible: false })            
        } else {            
            console.log('error:' + json.error)
        }

      this.setState({loading: false})
    }



    render() {

        const registerView = (
             <Register visible={this.state.registerVisible} selfClose={this.registrationSelfClose.bind(this)}/>
        )

        const loginModal = (
            <Modal className="modalLogin"
                title="Login"
                width={300}
                centered={true}
                visible={this.state.visible}
                closable={false}
                footer={[
                    <div className="modalLoginFooter" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button className="modalLoginButtonRegister"
                            style={{ backgroundColor: '#fff', borderColor: '#333', color: '#333' }}
                            onClick={() => this.setState({ registerVisible: true })}
                        >
                            Cadastro
                        </Button>
                        <Button className="modalLoginButtonLogin" type="primary"
                            style={{ backgroundColor: '#333', borderColor: '#333' }}
                            loading={this.state.loading}
                            onClick={() => this.login()}
                        >
                            Entrar
                        </Button>
                    </div>
                ]}
            >
                <div className="modalLoginBody">
                    <Input size="large" placeholder="Usuário" prefix={<UserOutlined />}
                        onChange={(value) => this.setState({ login: value.target.value })}
                    />
                    <Input.Password size="large" placeholder="Senha"
                        onChange={(value) => this.setState({ password: value.target.value })}
                    />
                </div>
            </Modal>
        )

        return (
            <div id="modalLogin">
                {loginModal}
                {registerView}
            </div>
        )
    }
}