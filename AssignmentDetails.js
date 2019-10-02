import React, { Component } from "react";
import ItemLocationTwo from "./ItemLocationTwo";
import { isUndefined } from "util";

class AssignmentDetails extends Component{
    constructor(props){
        super(props)

        this.myEventDetails= this.myEventDetails.bind(this);
        this.returnAssignments = this.returnAssignments.bind(this);
    }

    myEventDetails(myEventObject){
        this.props.myEventMain(myEventObject)
    }


    returnAssignments(){
        if(!isUndefined(this.props.mainItem.key)){
            return (
                <div style={{ marginTop: "20px", marginLeft: "20px" }}>
                    
                    <div style={{ marginBottom: "40px" }}>
                        <label><b>Employee Name: </b></label>
                        <br />
                        <span>{this.props.mainItem.employeeName}</span>
                        <br />
                        <span>{this.props.mainItem.employeeAddress}</span>
                        <br />
                        <br />
                        <label><b>School Name: </b></label>
                        <br />
                        <span>{this.props.mainItem.schoolName}</span>
                        <br />
                        <span>{this.props.mainItem.schoolAddress}</span>
                        <br />
                        <br />
                        <label><b>Teacher Name: </b></label>
                        <br />
                        <span>{this.props.mainItem.classroomName}</span>
                        <br />
                        <br />
                        <label><b>Classroom Schedule: </b></label>
                        <br />
                        <label>Start Time: </label><span>{this.props.mainItem.classroomStart}</span>
                        <br />
                        <label>End Time: </label><span>{this.props.mainItem.classroomEnd}</span>
                        <br />
                        <br />
                        <label><b>Route </b></label>
                        <br />
                        <label>Distance: </label><span>{this.props.mainItem.Distance}</span><span> Miles</span>
                        <br />
                        <label>Drive Time: </label><span>{this.props.mainItem.Duration}</span><span> Minutes</span>

                    </div>

                    <div>
                        <ItemLocationTwo item={this.props.mainItem} showing={this.props.showing}/>
                    </div>
                </div>
            )
        }else {
            return (<div></div>);
        }
    }




    render(){

        return (this.returnAssignments());
    }
}

export default AssignmentDetails;
