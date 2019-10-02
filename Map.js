import React, { Component } from 'react';

class Map extends Component {
    constructor(props) {
        super(props);
        
        
        this.onScriptLoad = this.onScriptLoad.bind(this);
        this.localItemID = this.props.incomingID;
    }


    onScriptLoad() {
        const geocoder = new window.google.maps.Geocoder();
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options
        );

        this.props.onMapLoad(map, geocoder)
    }

    componentDidMount() {
        if (!window.google) {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=AIzaSyDt5DOXRhJvvDqdExR88d8whBsJ-M1FY7k`;
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
            // Below is important. 
            //We cannot access google.maps until it's finished loading
            s.addEventListener('load', e => {
                this.onScriptLoad()
            })
        }else {
                this.onScriptLoad()
            }
        this.localItemID = this.props.incomingID;
    }

    render() {
        if(this.localItemID !== this.props.incomingID){
            this.localItemID = this.props.incomingID;
            this.onScriptLoad();
        }

        return (
            <div>
                <input className="Add" 
                    style={{ width: "100%", marginBottom: "10px", paddingTop: "10px", paddingBottom: "10px", color: "white", border: "none"  }} 
                    type="button" 
                    value="Update Map" 
                    onClick={this.onScriptLoad} 
                />
                <div style={{ width: "100%", height: 400 }} id={this.props.id} />
            </div>
        );
    }   
}

export default Map