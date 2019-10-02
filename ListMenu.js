import React, { Component } from "react";
import "./ListMenu.css";

class ListMenu extends Component {

    render() {

        return(
            <div>
                <ul>
                    {this.props.list}
                </ul>
            </div>
        );
    }
}

export default ListMenu;
