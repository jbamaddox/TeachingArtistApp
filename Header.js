import React, { Component } from "react";
import firebase from 'firebase';


class Header extends Component {


    LogOut() {
        firebase.auth().signOut()
    }


    render(props) {
        return (
            <div className="Header">
                
                <h1>{this.props.title}</h1>

                <button type="button" onClick={this.LogOut.bind(this)}>
                Log Out
                </button>


            </div>
        );
    }
}

export default Header;
