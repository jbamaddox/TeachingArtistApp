import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";


var destination = document.querySelector("#container");

document.getElementById("body").style.height = window.innerHeight + 'px';



ReactDOM.render( <App />, destination );
