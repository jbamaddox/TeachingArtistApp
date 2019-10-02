import React, { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import firebase from 'firebase';
//import * as firebase from 'firebase/app';



class LoginForm extends Component {
    // eslint-disable-next-line no-undef

    constructor(props) {
        super(props)
        
        this.state = { 
            email: "", 
            password: "", 
            error: "", 
            loading: false,
            loggedIn: false
        };

        this.AuthUser = null;


    }


    CreateNewAccount(){
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then( this.onLoginSuccess.bind(this) )
            .catch( this.onLoginFail.bind(this) );
    }


    LogIn() {

        if (!this.state.email | !this.state.password) {
            return this.onLoginFail.bind(this);
        } else if (this.state.email && this.state.password) {
            

            this.setState({ error: '', loading: true });

            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(() => {
                    this.onLoginSuccess.bind(this)
                })
                .catch(this.onLoginFail.bind(this))


            
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.setState({ loggedIn: true,  })
                    this.AuthUser = user;
                    
                } else {
                    this.setState({ loggedIn: false })

                }

            });
                
        }
        
    }


    onLoginFail() {
        this.setState({ error: 'Authentication Failed' });
    }

    onLoginSuccess() {
        this.setState({
            email: '',
            password: '',
            error: ''
        });

    }

    renderButton() {
        if (this.state.loading) {
            return <label size="small" />;
        } 
        
        return (
            <button onClick={this.onButtonPress.bind(this)}>
                    Log In
            </button>
        );
    }

    setEmail(e) {
        this.setState({ email: e.target.value })
    }

    setPassword(e) {
        this.setState({ password: e.target.value })
    }

    render() {
        return (
            <div className="flex-container-login-outer">
                <div className="flex-container-login">
                    <div>
                        <h2>
                            Welcome to the 
                            <br />
                            Teaching Artist Match Application
                        </h2>
                    </div>
                    <div>
                        <label style={{ width: "30%", float: "left" }}>
                            Username: 
                        </label>
                        <input
                                type="text"
                                placeholder="user@gmail.com"
                                onChange={ this.setEmail.bind(this) }
                                style={{ width: "70%", border: "none", padding: "0", float: "right" }}
                            />
                        
                    </div>
                    <br/>
                    <div>
                        <label style={{ width: "30%", float: "left" }}>
                            Password: 
                        </label>
                        <input
                                type="password"
                                placeholder="password"
                                onChange={this.setPassword.bind(this)}
                                style={{ width: "70%", border: "none", padding: "0", float: "right" }}
                            />
                    </div>
                    <br/>

                    <div>
                        <button onClick={this.LogIn.bind(this)}>
                        Log In
                        </button>
                    </div>
                    

                    <br/>
                    <br/>
                    <br/>

                    <div>
                        <button onClick={this.CreateNewAccount.bind(this)}>
                        Create a New Account
                        </button>
                    </div>
                    


                </div>
            </div>
        );
    }
}



export default LoginForm;
