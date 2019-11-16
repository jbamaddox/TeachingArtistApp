import React, { Component } from "react";
import firebase from "firebase";
import Header from "./Header";
import LoginForm from "./LoginForm";
import EmployeeDetails from "./EmployeeDetails";
import SchoolDetails from "./SchoolDetails";
import AssignmentDetails from "./AssignmentDetails";


class App extends Component{
    constructor (props) {
        super(props);

        this.state = {
            showing: "welcome",
            loggedIn: null
        };



        this.newEmployee = {};
        this.newSchool = {};
        this.newClassroom = {};
        
        this.employees = [];
        this.schools= [];
        this.assignments = [];
        this.noAssignment =[];
        this.classrooms = [];
        this.schoolIndex = 0;


        this.distance = "";
        this.duration = "";

        this.updateLocalFromDatabase = this.updateLocalFromDatabase.bind(this);

    }//constructor


    componentDidMount() {
        var promise = new Promise(( resolve) => {
            resolve(
                firebase.initializeApp({
                    apiKey: 'AIzaSyClCVB2w3F3mV1Y34-yXgcNTpdA0e8dPtk',
                    authDomain: 'teachingartistapp.firebaseapp.com',
                    databaseURL: 'https://teachingartistapp.firebaseio.com',
                    projectId: 'teachingartistapp',
                    storageBucket: 'teachingartistapp.appspot.com',
                    messagingSenderId: '1039398692345',
                    appId: '1:1039398692345:web:9f244f7779eb4ea8'
                })
            )//resolve
        })

        promise.then( () => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
    
                    console.log("User logged in")
    
                    //Update data from database
                    this.updateLocalFromDatabase()
                    this.setState({ loggedIn: true })
    
                } else {
                    console.log("user logged off")
                    this.setState({ showing: "welcome",  loggedIn: false })
                }
            })
        })//promise.then()
        

    }//componentDidMount


    mainDetailsToReturn(){
        if(this.state.showing === "welcome"){
            return (<div></div>)
        }else if(this.state.showing === "employees"){
            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "showSelected");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "");

            return (<EmployeeDetails sendEmployeesToED={this.employees}/>)


        }else if(this.state.showing === "schools"){
            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "showSelected");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "");

            return (<SchoolDetails  sendSchoolsToSD={this.schools}
                                    sendClassroomsToSD={this.classrooms}/>)


        }else if(this.state.showing === "assignments"){
            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "showSelected");

            return (<AssignmentDetails  ADSchools={this.schools}
                                        ADEmployees={this.employees}
                                        ADAssignments={this.assignments}
                                        ADNoAssignments={this.noAssignment}/>)


        }else{
            return(<div></div>)
        }
    }//mainDetailsToReturn

     
    updateLocalFromDatabase(){
       //Update employees, then schools, then classrooms, then initialize emp and sch states
        this.employees = [];

        //Update employee data
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees')
            .once('value', snapshot => {
                snapshot.forEach(childSnapshot => {
                    
                    this.newEmployee = {
                        
                        Name: childSnapshot.val().Name,
                        key: childSnapshot.val().key,
                        Priority: childSnapshot.val().Priority,
                        FirstName: childSnapshot.val().FirstName,
                        LastName: childSnapshot.val().LastName,
                        Street1: childSnapshot.val().Street1,
                        Street2: childSnapshot.val().Street2,
                        City: childSnapshot.val().City,
                        State: childSnapshot.val().State,
                        Zip: childSnapshot.val().Zip,
                        Address: childSnapshot.val().Address,
                        NumAssignments: childSnapshot.val().NumAssignments,
                        AvailableStart: childSnapshot.val().AvailableStart,
                        AvailableEnd: childSnapshot.val().AvailableEnd,
                        PseudoStart: childSnapshot.val().PseudoStart,
                        PseudoEnd: childSnapshot.val().PseudoEnd
                    
                    }
                    

                    this.employees.push(this.newEmployee)

                })
            })
            //Update school data
            .then(() => {
                
               
                this.schools = [];

                firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/schools')
                    .once('value', snapshot => {
                        snapshot.forEach(childSnapshot => {
                            
                            this.newSchool = {
                                Name: childSnapshot.val().Name,
                                key: childSnapshot.val().key,
                                Street1: childSnapshot.val().Street1,
                                Street2: childSnapshot.val().Street2,
                                City: childSnapshot.val().City,
                                State: childSnapshot.val().State,
                                Zip: childSnapshot.val().Zip,
                                Address: childSnapshot.val().Address,
                                Classrooms: {key: 0,
                                            ClassroomList: []
                                            },
                                ClassroomsAssigned: childSnapshot.val().ClassroomsAssigned,
                                TotalClassrooms: childSnapshot.val().TotalClassrooms
                            };

                            this.schools.push(this.newSchool)

                        })
                    })
                    //Update classroom data
                    .then(() => {
                        
                        //Clear current classroom list
                        this.classrooms = [];


                        //Add classroom to current list of classess
                        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms')
                            .once('value', snapshot => {
                                snapshot.forEach(childSnapshot => {
                                    
                                    this.newClassroom = {
                                        key: childSnapshot.val().key,
                                        schoolKey: childSnapshot.val().schoolKey,
                                        SchoolName: childSnapshot.val().SchoolName,
                                        Teacher: childSnapshot.val().Teacher,
                                        StartTime: childSnapshot.val().StartTime,
                                        EndTime: childSnapshot.val().EndTime,
                                        Assigned: childSnapshot.val().Assigned,
                                        Name: childSnapshot.val().Name
                                    };


                                    this.classrooms.push(this.newClassroom)

                                })
                            }).then(() => {
                                //Populate schools with classrooms
                                if(this.classrooms.length > 0){
                                    this.classrooms.forEach((cls) => {

                                        //Find the classroom's relative school based on the school key
                                        this.schoolIndex = this.schools.indexOf(
                                            this.schools.find(
                                            // eslint-disable-next-line array-callback-return
                                            (myIteratedObjectA) => {
                                                if (cls.schoolKey === myIteratedObjectA.key){

                                                    return myIteratedObjectA
                                                    
                                                }
                                            }   
                                        ))

                                        this.schools[this.schoolIndex].Classrooms.ClassroomList.push(cls)
                                    })
                                }

                            })//classrooms.then
                            //Update assignments
                            .then( () => {
                                this.assignments = [];

                                //Upload assignments from database
                                firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/assignments')
                                    .once('value', snapshot => {
                                        snapshot.forEach(childSnapshot => {

                                            var newAssignment={
                                                key: childSnapshot.val().key,
                                                Name: childSnapshot.val().Name,
                                                distance: childSnapshot.val().distance,
                                                duration: childSnapshot.val().duration,
                                                employeeKey: childSnapshot.val().employeeKey,
                                                employeeName: childSnapshot.val().employeeName,
                                                employeeAddress: childSnapshot.val().employeeAddress,
                                                schoolKey: childSnapshot.val().schoolKey,
                                                schoolName: childSnapshot.val().schoolName,
                                                schoolAddress: childSnapshot.val().schoolAddress,
                                                classroomKey: childSnapshot.val().classroomKey,
                                                classroomName: childSnapshot.val().classroomName,
                                                classroomStart: childSnapshot.val().classroomStart,
                                                classroomEnd: childSnapshot.val().classroomEnd
                                            }
                                        
                                        
                                            this.assignments.push(newAssignment)
                                        
                                        })
                                    })//firebase.once
                                    //Update classes without assignments
                                    .then( () => {
                                        //Clear current list of classrooms without assignments
                                        this.noAssignment = [];


                                        //Add classroom to current list of classess
                                        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classesWithoutAssignments')
                                            .once('value', snapshot => {
                                                snapshot.forEach(childSnapshot => {
                                                    
                                                    var newNoClassroom = {
                                                        key: childSnapshot.val().key,
                                                        classroomKey: childSnapshot.val().classroomKey,
                                                        schoolKey: childSnapshot.val().schoolKey,
                                                        SchoolName: childSnapshot.val().SchoolName,
                                                        Teacher: childSnapshot.val().Teacher,
                                                        StartTime: childSnapshot.val().StartTime,
                                                        EndTime: childSnapshot.val().EndTime,
                                                        Assigned: childSnapshot.val().Assigned,
                                                        Name: childSnapshot.val().Name
                                                    };


                                                    this.noAssignment.push(newNoClassroom)

                                                })
                                            })//firebase.classesWithoutAssignments.once()
                                    })//classes without assignments.then

                            })//assignments

                    })//schools.then

            })//employees.then

    }//updateLocalFromDatabase


    ApplicationToReturn(){
        if(this.state.loggedIn === false){
            return(<LoginForm /> );
        }else{
            return(
                <div>
                    {/* Return the header */}
                    <Header title={"Teaching Artist Matching Application"}/>

                    <div className="HideLeftMenu" />


                    {/* Return the Menu buttons and list of related items */}
                    <div className="LeftMenu" >
                        
                            {/* Menu buttons */}   
                            <button className="showEmpButton" 
                                    onClick={() => this.setState({ showing: "employees" })}>
                                        Employees
                            </button>

                            <button className="showSchButton"
                                    onClick={() => this.setState({ showing: "schools" })}
                                    >
                                        Schools
                            </button>

                            <button className="showAssignmentsButton"
                                    onClick={() => this.setState({ showing: "assignments"})}
                                    >
                                        Assignments
                            </button>

                    </div>


                    {/* Return the details of the item selected from the list*/}
                    <div className="MainDetails">
                        {this.mainDetailsToReturn()}
                        
                        
                    </div>


                </div>
            );
        }

    }//ApplicationToReturn


    render() {


        //Return the application data
        return (this.ApplicationToReturn());
    }

}


export default App;
