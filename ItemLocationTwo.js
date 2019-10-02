import React, { Component } from 'react';
import MapTwo from './MapTwo'
  
class ItemLocationTwo extends Component{
    constructor() {
        super();

        this.address = "Minneapolis, MN"
    }

    render() {
        this.address = this.props.item.employeeAddress;
        this.address2 = this.props.item.schoolAddress;
        

        return ( 
                <MapTwo
                    id="myMap"
                    options={{
                        center: { lat:  44.986656, lng: -93.258133 },
                        zoom: 11
                        }}

                    onMapLoad={(ds, dd) => {
                        
                        
                        var request = {
                            origin: this.address,
                            destination: this.address2,
                            travelMode: 'DRIVING'
                        };
                            ds.route(request, function(response, status) {
                            if (status === 'OK') {
                                dd.setDirections(response);
                            }
                        });

                        /*geo.geocode( { 'address': this.address}, function(results, status){
                            // eslint-disable-next-line eqeqeq
                            if (status == 'OK') {
                                map.setCenter(results[0].geometry.location);

                                // eslint-disable-next-line no-unused-vars
                                var marker = new window.google.maps.Marker({
                                    position: results[0].geometry.location,
                                    map: map
                                });
                            }
                        })*/
                        
                    }}

                    incomingID={this.props.item.key}
                />
            );
        
    }
}


export default ItemLocationTwo;
