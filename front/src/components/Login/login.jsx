import React, { Component } from 'react'
import { Modal, Button, Input, message } from 'antd';
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
        try{
            const response = await fetch(`${USER_SERVER}/auth/public/login/`, {
                method: "POST",
                headers: {                
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({                
                    login: this.state.login,
                    password: this.state.password
                }),
                
            })                
            if(response.status === 200){
                var json = await response.json()
                this.props.onSuccess(json.token)
                this.setState({ visible: false }) 
            } else {
                message.error('Login unsuccessful, try again')
            }
        }catch(e){
            message.error('Server not responding, try again later')
        }
        

      this.setState({loading: false})
    }



    render() {

        const registerView = (
             <Register visible={this.state.registerVisible} selfClose={this.registrationSelfClose.bind(this)}/>
        )

        const loginModal = (
            <Modal className="modalLogin"
                title="Sign in"
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
                            Sign up
                        </Button>
                        <Button className="modalLoginButtonLogin" type="primary"
                            style={{ backgroundColor: '#333', borderColor: '#333' }}
                            loading={this.state.loading}
                            onClick={() => this.login()}
                        >
                            Login
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