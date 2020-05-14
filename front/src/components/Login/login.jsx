import React, { Component } from 'react'
import { Modal, Button, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './login.css'

export default class Login extends Component {

    constructor(props) {
        super(props)

        this.state = {
            login: undefined,
            password: undefined,

            visible: true,
            loading: false,
        }
    }


    register = () => {

    }

    login = async () => {
        this.setState({ loading: true })
        this.props.onSuccess('userToken')
        setTimeout(() => {
            this.setState({ visible: false })
        }, 1000);

        /*const h = {
            //'access-token' : JSON.parse(sessionStorage.getItem('token')),
            'Content-Type': 'application/json'
        }
        const response = await fetch('http://192.168.0.107:5000' + '/api/user/', {
            method: "POST",
            body: JSON.stringify({
                nickName: "testefront",
                login: this.state.login,
                password: this.state.password
            }),
            headers: h,
        })
        console.log(response)
        var json = await response.json()

        if (json.status === 'true') {
            this.setState({ visible: false })
            console.log("sucesso")
        } else {
            this.setState({ loading: false })
            console.log(json.error)
        }*/

    }



    render() {

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
                            onClick={() => this.register()}
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
            </div>
        )
    }
}