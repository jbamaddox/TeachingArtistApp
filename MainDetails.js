import React, { Component } from "react";
import EmployeeDetails from "./EmployeeDetails";
import SchoolDetails from "./SchoolDetails";
import AssignmentDetails from "./AssignmentDetails";
import Welcome from "./Welcome";
import { isUndefined } from "util";

class MainDetails extends Component{
    constructor(props){
        super(props);

        this.myEventMain =  this.myEventMain.bind(this);
        this.toMainReturn = this.toMainReturn.bind(this);
        this.selectClassroomInMain = this.selectClassroomInMain.bind(this);
        this.myClassDetailsMain = this.myClassDetailsMain.bind(this);
        this.addClassroom = this.addClassroom.bind(this);
        this.deleteClassroom = this.deleteClassroom.bind(this);
        this.saveEmployeeChanges = this.saveEmployeeChanges.bind(this)
        this.saveSchoolChanges = this.saveSchoolChanges.bind(this)
        this.saveClassroomChanges = this.saveClassroomChanges.bind(this)
        this.discardEmployeeChanges = this.discardEmployeeChanges.bind(this)
        this.discardSchoolChanges = this.discardSchoolChanges.bind(this)
        this.discardClassroomChanges = this.discardClassroomChanges.bind(this)
    }
   
    componentDidMount(){
        console.log("Main Details loaded")
    }

    myEventMain(e){
        //Send Even data up to App
        this.props.myEventApp(e);
    }

    selectClassroomInMain(cl){
        this.props.selectClassroomInApp(cl);
    }

    myClassDetailsMain(cdm){
        this.props.myClassDetailsApp(cdm);
    }

    addClassroom(){
        this.props.addClassroom()
    }

    deleteClassroom(cls){
        this.props.deleteClassroom(cls);
    }

    saveEmployeeChanges(){
        //Send command to save data up to App
        this.props.saveEmployeeChanges()
    }

    saveSchoolChanges(){
        this.props.saveSchoolChanges()
    }

    saveClassroomChanges(){
        this.props.saveClassroomChanges()
    }

    discardEmployeeChanges(){
        this.props.discardEmployeeChanges()
    }

    discardSchoolChanges(){
        this.props.discardSchoolChanges()
    }

    discardClassroomChanges(){
        this.props.discardClassroomChanges();
    }


    toMainReturn() {
        if (isUndefined(this.props.mainItem)){
            return (<div></div>);
        }else {
            switch(this.props.showing){
                case "employees":
                    return (<EmployeeDetails    mainItem={this.props.mainItem}
                                                myEventMain={this.myEventMain}
                                                showing={this.props.showing}
                                                saveEmployeeChanges={this.saveEmployeeChanges}
                                                discardEmployeeChanges={this.discardEmployeeChanges}/>
                                                );

                case "schools":
                    return (<SchoolDetails  mainItem={this.props.mainItem}
                                            myEventMain={this.myEventMain}
                                            showing={this.props.showing}
                                            myClassDetailsMain={this.myClassDetailsMain}
                                            selectClassroomInMain={this.selectClassroomInMain}
                                            addClassroom={this.addClassroom}
                                            classToShowSD={this.classToShowMain}
                                            deleteClassroom={this.deleteClassroom} 
                                            saveSchoolChanges={this.saveSchoolChanges}
                                            saveClassroomChanges={this.saveClassroomChanges}
                                            discardSchoolChanges={this.discardSchoolChanges}
                                            discardClassroomChanges={this.discardClassroomChanges}/>);
                
                case "assignments":
                    return (<AssignmentDetails  mainItem={this.props.mainItem}
                                                showing={this.props.showing}/>);

                case "welcome":
                    return (<Welcome />);

                default:
            }
        }
    }




    render() {
        this.classToShowMain = this.props.classToShowApp;

        return this.toMainReturn();
    }

}

export default MainDetails;
