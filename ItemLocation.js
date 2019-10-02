import React, { Component } from 'react';
import Map from './Map'
  
class ItemLocation extends Component{
    constructor() {
        super();

        this.address = "Minneapolis, MN"
    }

    render() {
        this.address = this.props.item.Address + ", USA";
        
        
        return ( 
                <Map
                    id="myMap"
                    options={{
                        center: { lat:  44.986656, lng: -93.258133 },
                        zoom: 11
                        }}

                    onMapLoad={(map, geo) => {
                        geo.geocode( { 'address': this.address}, function(results, status){
                            // eslint-disable-next-line eqeqeq
                            if (status == 'OK') {
                                map.setCenter(results[0].geometry.location);

                                // eslint-disable-next-line no-unused-vars
                                var marker = new window.google.maps.Marker({
                                    position: results[0].geometry.location,
                                    map: map
                                });
                            }
                        })
                        
                    }}

                    incomingID={this.props.item.key}
                />
            );
        
    }
}


export default ItemLocation;
