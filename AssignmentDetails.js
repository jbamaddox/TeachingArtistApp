/* eslint-disable no-loop-func */
import React, { Component } from "react";
import ItemLocationTwo from "./ItemLocationTwo";
import { isUndefined } from "util";
import ListMenu from "./ListMenu";
import firebase from "firebase";


class AssignmentDetails extends Component{
    constructor(props){
        super(props)

        this.state = {
            asnShow: {}
        }

        this.listToShow = [];
        this.assignments = [];
        this.listClassNoAsn = [];

        this.employees = [];
        this.schools =   [];
        this.classrooms = [];
        this.totalClassrooms = 0;
        this.empschDistance = [];
        

        this.createAssignments = this.createAssignments.bind(this);

        this.returnAssignmentDetails = this.returnAssignmentDetails.bind(this)

        this.createAssignmentList = this.createAssignmentList.bind(this);
        this.createNoAssignmentList = this.createNoAssignmentList.bind(this);
        this.setSelectedStyle = this.setSelectedStyle.bind(this);
        this.addAssignment = this.addAssignment.bind(this);

        this.returnQuickAdd = this.returnQuickAdd.bind(this)
        this.returnAssignments = this.returnAssignments.bind(this);

    }

    componentDidMount(){
        this.employees = this.props.ADEmployees
        this.schools = this.props.ADSchools
        this.assignments = this.props.ADAssignments
        this.listClassNoAsn =this.props.ADNoAssignments

        this.setState({ asnShow: {} })
    }

    

    createAssignments(){
        //Runs when a user selects to create assignments

        
        //Verify that addresses exist for employees and schools and that every classroom has a starttime and endtime
        var emptyEmpAddress = 0;
        var emptySchAddress = 0;
        var emptyClassSchedule = 0;

        this.employees.forEach((emp) => {
            if(emp.Address === null || emp.Address === ""){
                emptyEmpAddress = emptyEmpAddress + 1
            }
        })

        this.schools.forEach((sch) => {
            if(sch.Address === null || sch.Address === ""){
                emptySchAddress = emptySchAddress + 1
            }


        })

        this.classrooms.forEach((cls) => {
            if(cls.StartTime === null || cls.StartTime === "" || cls.StartTime <= 0
                || cls.EndTime === null || cls.EndTime === "" || cls.EndTime === 0 || cls.EndTime >=2400){
                    emptyClassSchedule = emptyClassSchedule + 1
            }

        })


        //If at least 1 employee and school each exist, continue
        if (this.employees.length > 0 && this.schools.length > 0 
            && emptyEmpAddress === 0 && emptySchAddress === 0 && emptyClassSchedule ===  0){
            
            //Add up all the classrooms
            this.totalClassrooms = 0;
            this.schools.forEach((sch) => {
                this.totalClassrooms = this.totalClassrooms + sch.Classrooms.ClassroomList.length
            })


            //If there are classrooms to create assignments for, create assignments
            if (this.totalClassrooms > 0 ){
                //Delete assignments from database
                if(this.assignments.length > 0){
                        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/assignments' )
                        .remove()


                    //Clear Assignments
                    this.assignments = [];
                }


                //Delete classesWithoutAssignments from database
                if(this.listClassNoAsn.length > 0){
                            firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classesWithoutAssignments' )
                                .remove()
                        
                    //Reset Array
                    this.listClassNoAsn = []
                }
            

                //------------Prep School ------------//
                
                //For each school:
                    //Reset number of assigned classrooms
                    //Add addresses to array for Google
                    //Order classrooms from earliest to latest
                    //Set each classroom as not assigned
                    //Sum all assignments for maxAssignments

                var maxAssignments = 0;
                var schoolAddresses = [];

                this.schools.forEach((sch) => {
                    //Reset number of assigned classrooms
                    sch.ClassroomsAssigned = 0;

                    //Add addresses to array for Google
                    schoolAddresses.push(sch.Address)

                    //Order classrooms from earliest to latest
                    sch.Classrooms.ClassroomList.sort((a, b) => {
                        if (a.StartTime > b.StartTime){
                            return 1
                        }else if (a.StartTime < b.StartTime){
                            return -1
                        }else {
                            return 0
                        }
                    })

                    //Set each classroom as not assigned
                    sch.Classrooms.ClassroomList.forEach((cls) => {
                        cls.Assigned = 0
                    })

                    //Sum all assignments for max
                    maxAssignments = maxAssignments + sch.Classrooms.ClassroomList.length
                });
                
                maxAssignments = maxAssignments/this.employees.length;




                //------------Prep Employees ------------//

                //For each employee:
                    //Reset all employees pseudo availability
                    //Reset NumAssignments

                var employeeAddresses = [];

                this.employees.forEach((emp) => {
                    //Reset all employees pseudo availability
                    emp.PseudoStart = emp.AvailableStart;
                    emp.PseudoEnd = emp.AvailableEnd;

                    //reset employees.NumAssignments
                    emp.NumAssignments = 0
                    employeeAddresses.push(emp.Address)
                })


                
                //------------Emp Sch Distance ------------//
                //Create an array of distances between all schools and all employees


                //Empty the list of distances for each employee to the school
                this.empschDistance = [];


                //Get the distance data from google
                var service = new window.google.maps.DistanceMatrixService();

                service.getDistanceMatrix({
                    origins: employeeAddresses,
                    destinations: schoolAddresses,
                    travelMode: 'DRIVING',
                    unitSystem: window.google.maps.UnitSystem.IMPERIAL
                
                }, (response, status) => {

                    if (status === 'OK') {

                        var origins = response.originAddresses;
                        var destinations = response.destinationAddresses;

                        //Create distance object based on results from Google
                        for (var i = 0; i < origins.length; i++) {
                            var results = response.rows[i].elements;
                            for (var j = 0; j < results.length; j++) {
                                var element = results[j];
                                var distance = parseFloat(element.distance.text);
                                var duration = parseFloat(element.duration.text);
                                var from = origins[i];
                                var to = destinations[j];

                                
                                var newDistance = {
                                    distance: distance,
                                    duration: duration,
                                    employeeKey: this.employees[i].key,
                                    employeeAddress: from,
                                    employeePriority: this.employees[i].Priority,
                                    schoolKey: this.schools[j].key,
                                    schoolAddress: to
                                }

                                this.empschDistance.push(newDistance);
                            }//if(j)
                        }//if(i)
                    }//if (status === 'OK')



                    //Sort the list of distances:
                    //by employee priority (Highest Priority comes first), 
                    //then by distance (Lowest Distance comes first)

                    this.empschDistance.sort((a, b) =>{
                        if (a.employeePriority > b.employeePriority){
                            return -1
                        }else if(a.employeePriority < b.employeePriority){
                            return 1
                        }else{
                            if(a.distance > b.distance){
                                return 1
                            }else if(a.distance < b.distance){
                                return -1
                            }else{
                                return 0
                            }
                        }
                    })//this.empschDistance.sort
        
        
        
                    //For each empschDistance object: 
                        //find the school in the schools[] array,
                        //find the employee in the employees[] array,
                        //Test the employee's schedule against the school's classrooms
                    this.empschDistance.forEach((dist) => {
                        

                        //Find the index of the distance object's school in the school array
                        var indexOfSchool = null
                        var indexOfEmployee = null

                        for(var si = 0; si < this.schools.length; si++){
                            if(dist.schoolKey === this.schools[si].key){
                                indexOfSchool = si;
                                break;
                            }
                        }

                        for(var ei = 0; ei < this.employees.length; ei++){
                            if(dist.employeeKey === this.employees[ei].key){
                                indexOfEmployee = ei;
                                break;
                            }
                        }

                        
                        //Test the employee's schedule against the school's classrooms
                        //and assign the employee to the classroom if the schedule fits
                        if(this.employees[indexOfEmployee].NumAssignments <= maxAssignments){
                            
                            this.schools[indexOfSchool].Classrooms.ClassroomList.forEach((cl) => {
                                
                                if (cl.Assigned === 0 && 
                                    Number( cl.StartTime ) >= Number( this.employees[indexOfEmployee].PseudoStart ) && 
                                    Number( cl.EndTime ) <= Number( this.employees[indexOfEmployee].PseudoEnd ) 
                                    )
                                {
                                    //Set classroom as assigned
                                    cl.Assigned = 1;
                                    
                                    //Add to the number of classrooms the employee is assigned to
                                    this.employees[indexOfEmployee].NumAssignments++


                                    //Reset Employee availability
                                    this.employees[indexOfEmployee].PseudoStart = cl.EndTime;
                                    
                                    
                                    //Add create an database and local assignment based on the match                                    
                                    this.addAssignment(this.employees[indexOfEmployee],this.schools[indexOfSchool], cl, dist);
                                    
                                    //Increase the schools.ClassroomAssigned int
                                    this.schools[indexOfSchool].ClassroomsAssigned = this.schools[indexOfSchool].ClassroomsAssigned + 1;
                                }//if (cl.Assigned === 0 &&...
                            
                            })//this.schools[indexOfSchool].Classrooms.ClassroomList.forEach()

                        }//if(this.employees[indexOfEmployee].NumAssignments <= maxAssignments)

                                    
                    }) //this.empschDistance.forEach()
                                
                        
                        

                    //--------------- classesWithoutAssignments ---------------//
                    
                    //Populate Database/Local Array for classes with no assignment 
                    
                    //For each school check all classrooms
                    this.schools.forEach((sch) => {

                        //If the classroom has no assignment, add it to the NoAssignment list (database and local)
                        sch.Classrooms.ClassroomList.forEach((cls) => {
                            if(cls.Assigned === 0){
                                
                                //First create a key
                                var clsNoAsnKey = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classesWithoutAssignments').push().key

                                //Populate the item
                                var newNoClassroom = {
                                    key: clsNoAsnKey,
                                    classroomKey: cls.key,
                                    schoolKey: cls.schoolKey,
                                    SchoolName: cls.SchoolName,
                                    Teacher: cls.Teacher,
                                    StartTime: cls.StartTime,
                                    EndTime: cls.EndTime,
                                    Assigned: cls.Assigned,
                                    Name: cls.Name
                                }

                                //Update data at key in database
                                firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classesWithoutAssignments/' + clsNoAsnKey)
                                    .update({
                                        key: newNoClassroom.key,
                                        classroomKey: newNoClassroom.key,
                                        schoolKey: newNoClassroom.schoolKey,
                                        SchoolName: newNoClassroom.SchoolName,
                                        Teacher: newNoClassroom.Teacher,
                                        StartTime: newNoClassroom.StartTime,
                                        EndTime: newNoClassroom.EndTime,
                                        Assigned: newNoClassroom.Assigned,
                                        Name: newNoClassroom.Name
                                    })
                                        
                                //Add classroom to the local list
                                this.listClassNoAsn.push(newNoClassroom);
                            }//if(cls.Assigned === 0)
                        })//sch.Classrooms.ClassroomList.forEach()...
                    })//this.schools.forEach()
                        
                    //Refresh data in view
                    this.setState({ asnShow: {} })
                    })//(response, status)   //service.getDistanceMatrix

            }//if (this.totalClassrooms > 0 )

        }//if (this.employees.length > 0 && this.schools.length > 0)

    }//createAssignments End


    //supply keys of the employee, school and classroom
    addAssignment(e,s, c, d){
        var asnKey = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/assignments').push().key

        var newAssignment={
            key: asnKey,
            Name: e.Name + ": " + s.Name + " | " + c.Teacher,
            distance: d.distance,
            duration: d.duration,
            employeeKey: e.key,
            employeeName: e.Name,
            employeeAddress: e.Address,
            schoolKey: s.key,
            schoolName: s.Name,
            schoolAddress: s.Address,
            classroomKey: c.key,
            classroomName: c.Teacher,
            classroomStart: c.StartTime,
            classroomEnd: c.EndTime
        }

        //Create new assignment in database
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/assignments/' + newAssignment.key)
            .update({ 
                
                key: newAssignment.key,
                Name: newAssignment.Name,
                distance: newAssignment.distance,
                duration: newAssignment.duration,
                employeeKey: newAssignment.employeeKey,
                employeeName: newAssignment.employeeName,
                employeeAddress: newAssignment.employeeAddress,
                schoolKey: newAssignment.schoolKey,
                schoolName: newAssignment.schoolName,
                schoolAddress: newAssignment.schoolAddress,
                classroomKey: newAssignment.classroomKey,
                classroomName: newAssignment.classroomName,
                classroomStart: newAssignment.classroomStart,
                classroomEnd: newAssignment.classroomEnd
                
            })

        //Add assignment object to local array
        this.assignments.push(newAssignment)
    }//addAssignment
    
    
    createAssignmentList(assignment){
        return  <li key={assignment.key}>
                    <button className="AsnList"
                            onClick={() => this.setState({ asnShow: assignment }) }
                            style={this.setSelectedStyle(assignment.key)}>
                        {assignment.Name}
                    </button>
                </li>
    }//createAssignmentList


    createNoAssignmentList(cls){
        return  <li key={cls.key}>
                    <button className="NoAsnList" 
                            type="button">
                        {cls.SchoolName + ": " + cls.Teacher}
                    </button>
                </li>
    }//createNoAssignmentList

    
    setSelectedStyle(K){
        //This function accents the selected listed employee, school, classroom, or assignment
        var styleSet = {};
        

        if(isUndefined(this.state.asnShow.key)){
            styleSet = { 
                Selected:{}
            }
        }else if(this.state.asnShow.key === null ){
            styleSet = { 
                Selected:{}
            }
        }else if(this.state.asnShow.key === K){
            styleSet = {
                Selected:{
                    boxShadow: "0px 6px 8px 1px rgba(2,2,2,0.5)",
                    backgroundColor: "rgb(255,182,45)",
                    zIndex: 21,
                    position: "relative",
                    color: "black"
                }
            }
        }


        return styleSet.Selected
    }//setSelectedStyle


    returnQuickAdd(){
        
        return(
            <div className="quickFormAsn" >
                <button 
                        style={{ float: "Left", width: "80%", marginBottom: "20px", marginLeft: "10%" }}
                        className="Add"
                        type="button"
                        onClick={this.createAssignments}>Create Assignments</button>
            </div>
        )
    }//returnQuickAdd


    returnAssignmentDetails(){
        if (!this.state.asnShow.key){
            return(<div></div>)
        }else{
            return(
                <div className="flex-container-assignment">

                    <div style={{ marginBottom: "40px" }}>
                            <label><b>Employee Name: </b></label>
                            <br />
                            <span>{this.state.asnShow.employeeName}</span>
                            <br />
                            <span>{this.state.asnShow.employeeAddress}</span>
                            <br /><br />

                            <label><b>School Name: </b></label>
                            <br />
                            <span>{this.state.asnShow.schoolName}</span>
                            <br />
                            <span>{this.state.asnShow.schoolAddress}</span>
                            <br /><br />

                            <label><b>Teacher Name: </b></label>
                            <br />
                            <span>{this.state.asnShow.classroomName} | {this.state.asnShow.classroomStart} - {this.state.asnShow.classroomEnd}</span>
                            <br /><br />

                            <label><b>Route </b></label>
                            <br />
                            <span>{this.state.asnShow.distance} Miles  |  {this.state.asnShow.duration} Minutes</span>

                        </div>

                        <div>
                            <ItemLocationTwo item={this.state.asnShow} />
                        </div>
                </div>
            );
        }
    }//returnAssignmentDetails


    returnAssignments(){
        
            return (

                <div >

                    <div className="ListDiv" style={{ padding: "0", width: "25%", position: "absolute", left: "0", marginTop: "150px" }}>
                        {this.returnQuickAdd()}

                        <ListMenu   list={this.listToShow} />
                        <ListMenu   list={this.listClassNoAsnShow} />

                    </div>


                    {this.returnAssignmentDetails()}

                </div>
            )

    }//returnAssignments


    render(){
        this.listToShow = this.assignments.map(this.createAssignmentList);
        this.listClassNoAsnShow = this.listClassNoAsn.map(this.createNoAssignmentList);


        return (this.returnAssignments());
    }//render

}

export default AssignmentDetails;
