import React, { Component } from "react";
import LabelInput from "./LabelInput";
import ItemLocation from "./ItemLocation";
import { isUndefined } from "util";

class EmployeeDetails extends Component{
    constructor(props){
        super(props)

        this.mainItem = this.props.mainItem

        this.myEventDetails= this.myEventDetails.bind(this);
        this.saveEmployeeChanges = this.saveEmployeeChanges.bind(this);
        this.employeeForm = this.employeeForm.bind(this);
        this.discardEmployeeChanges = this.discardEmployeeChanges.bind(this);
    }

    myEventDetails(myEventObject){
        //Send Label Input data up to Main Details
        this.props.myEventMain(myEventObject)
    }


    saveEmployeeChanges(){
        //Send employee object key up to Main Details
        this.props.saveEmployeeChanges()
    }

    discardEmployeeChanges(){
        this.props.discardEmployeeChanges()
    }

    employeeForm(){
        if(isUndefined(this.props.mainItem.key)){
            return(<div></div>)
        }else if(this.props.mainItem.key === null){
            return(<div></div>)
        }else{
            return(
                <div className="flex-container-employee">
                        <div >
                            <div style={{ textAlign: "center" }}><h2><b>Employee Details</b></h2></div>
                            <form>
                                <LabelInput myEvent={this.myEventDetails} label="FirstName" item={this.props.mainItem.FirstName} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="LastName" item={this.props.mainItem.LastName} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="Street1" item={this.props.mainItem.Street1} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="Street2" item={this.props.mainItem.Street2} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="City" item={this.props.mainItem.City} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="State" item={this.props.mainItem.State} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="Zip" item={this.props.mainItem.Zip} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="AvailableStart" item={this.props.mainItem.AvailableStart} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="AvailableEnd" item={this.props.mainItem.AvailableEnd} itemKey={this.props.mainItem.key}/>
                                <LabelInput myEvent={this.myEventDetails} label="Priority" item={this.props.mainItem.Priority} itemKey={this.props.mainItem.key}/>
                            </form>

                            <button 
                                    style={{ marginTop: "15px" }}
                                    className="SaveButtons"
                                    type="button"
                                    onClick={this.saveEmployeeChanges}>Save Changes</button>

                            <button 
                                    className="DiscardButtons"
                                    type="button"
                                    onClick={this.discardEmployeeChanges}>Discard Changes</button>
                        </div>


                        <div>
                            <ItemLocation item={this.props.mainItem}/>
                        </div>
                </div>
            );
        }
    }

    render(){
        return (this.employeeForm());
    }

}

export default EmployeeDetails;
