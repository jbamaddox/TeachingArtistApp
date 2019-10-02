import React, { Component } from "react";

class LabelInput extends Component {
    constructor(props){
        super(props);


        this.handleChange = this.handleChange.bind(this);
    }
    
    

    handleChange(e){
        var myEventObject = {
                    value: e.target.value,
                    name: e.target.name,
                    key: this.props.itemKey
                }

    
        this.props.myEvent(myEventObject);
    }

    render(){
        

        return(
            <div style={{ paddingTop: "10px", width: "100%", float: "left" }} >
                <label style={{  paddingLeft: "5%", paddingRight: "0px", width: "25%" }}>{ this.props.label }</label>
                <input style={{ float: "right", width: "60%", marginRight: "1%" }}
                    type="text"
                    inputkey={this.props.itemKey}
                    name={this.props.label}
                    ref={(a) => this._inputElement = a}
                    value = { this.props.item }
                    onChange={this.handleChange} />

            </div>
        );
    }

}

export default LabelInput;
