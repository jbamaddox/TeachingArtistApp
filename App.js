import React, { Component } from "react";
import firebase from "firebase";
import Header from "./Header";
import MainDetails from "./MainDetails";
import ListMenu from "./ListMenu";
import LoginForm from "./LoginForm";
import { isUndefined } from "util";


class App extends Component{
    constructor (props) {
        super(props);

        this.state = {
            showing: "welcome",
            empShow: {},
            schShow: {},
            asnShow: {},
            clsShow: {},
            loggedIn: false
        };



        this.newEmployee = {};
        this.newSchool = {};
        this.newClassroom = {};
        
        this.listToShow = [];
        this.employees = [];
        this.schools= [];
        this.empschDistance= [];
        this.assignments = [];
        this.classrooms = [];
        this.listClassNoAsn = [];
        this.schoolIndex = 0;

        this.iAmMain = null;
        this.listLength = 0;

        this.distance = "";
        this.duration = "";

        this.updateEmpSchFromDatabase = this.updateEmpSchFromDatabase.bind(this);


        
        /*********************************************
        Employee function binds, variables, and objects 
        ***********************************************/

        this.tempEmpToUpdate = {
            key: null,
            Name: null,
            Priority: null,
            FirstName: null,
            LastName: null,
            Street1: null,
            Street2: null,
            City: null,
            State: null,
            Zip: null,
            Address: null,
            NumAssignments: null,
            AvailableStart: null,
            AvailableEnd: null,
            PseudoStart: null,
            PseudoEnd: null
        }

        this.needToSaveEmp = 0;
        this.empIndex = null;

        this.setShowToEmployees = this.setShowToEmployees.bind(this);
        this.createEmployeeList = this.createEmployeeList.bind(this);
        this.saveEmployeeChanges = this.saveEmployeeChanges.bind(this);
        this.setEmployeeToShowInMainArea = this.setEmployeeToShowInMainArea.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this);
        this.discardEmployeeChanges = this.discardEmployeeChanges.bind(this);



        /********************************************
        School functions binds, variables, and objects 
        ***********************************************/
        this.tempSchToUpdate = {
            Name: null,
            key: null,
            Street1: null,
            Street2: null,
            City: null,
            State: null,
            Zip: null,
            Address: null,
            Classrooms: null,
            ClassroomsAssigned: null,
            TotalClassrooms: null
        }
        
        this.schIndex = null;
        this.needToSaveSch = 0;

        this.setShowToSchools = this.setShowToSchools.bind(this);
        this.createSchoolList = this.createSchoolList.bind(this);
        this.setSchoolToShowInMainArea = this.setSchoolToShowInMainArea.bind(this);
        this.deleteSchool = this.deleteSchool.bind(this);
        this.saveSchoolChanges = this.saveSchoolChanges.bind(this);
        this.discardSchoolChanges = this.discardSchoolChanges.bind(this);



        /******************************************
        Classroom functions, variables, and objects 
        *******************************************/

       this.tempClsToUpdate = {
            key: null,
            schoolKey: null,
            SchoolName: null,
            Teacher: null,
            StartTime: null,
            EndTime: null,
            Assigned: null,
            Name: null
        }

        this.needToSaveCls = 0;
        this.clsIndexInSchool = null;
        this.clsIndexInClassrooms = null;
        this.totalClassrooms = 0;

        this.selectClassroomInApp = this.selectClassroomInApp.bind(this);
        this.myClassDetailsApp = this.myClassDetailsApp.bind(this);
        this.addClassroom = this.addClassroom.bind(this);
        this.deleteClassroom = this.deleteClassroom.bind(this);
        this.updateClassroomsFromDatabase = this.updateClassroomsFromDatabase.bind(this)
        this.saveClassroomChanges = this.saveClassroomChanges.bind(this)
        this.discardClassroomChanges = this.discardClassroomChanges.bind(this)


        /*Assignments*/
        this.setShowToAssignments = this.setShowToAssignments.bind(this);
        this.createAssignmentList = this.createAssignmentList.bind(this);
        this.createAssignments = this.createAssignments.bind(this);
        this.addEmpSchDistanceObject = this.addEmpSchDistanceObject.bind(this);


        /*Helper Functions*/
        this.add = this.add.bind(this);

        this.setEventApp = this.setEventApp.bind(this);

        this.findIndexofObject = this.findIndexofObject.bind(this);
        this.updateTempEmployeeData = this.updateTempEmployeeData.bind(this);
        this.updateSchoolData = this.updateSchoolData.bind(this);
        this.returnQuickAdd = this.returnQuickAdd.bind(this);



        this.loadClassesNoAsn = this.loadClassesNoAsn.bind(this);
        this.createNoAssignmentList = this.createNoAssignmentList.bind(this);
        
    }//constructor


    componentWillMount() {
        firebase.initializeApp({
            apiKey: 'AIzaSyClCVB2w3F3mV1Y34-yXgcNTpdA0e8dPtk',
            authDomain: 'teachingartistapp.firebaseapp.com',
            databaseURL: 'https://teachingartistapp.firebaseio.com',
            projectId: 'teachingartistapp',
            storageBucket: 'teachingartistapp.appspot.com',
            messagingSenderId: '1039398692345',
            appId: '1:1039398692345:web:9f244f7779eb4ea8'
        });

    }

    componentDidMount(){
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {

                this.setState({ loggedIn: true })
                console.log("User logged in")

                //Update local employee list from database
                this.updateEmpSchFromDatabase()

                

            } else {

                console.log("user logged off")

                this.setState({
                    showing: "welcome",
                    empShow: {},
                    schShow: {},
                    asnShow: {},
                    clsShow: {},
                    loggedIn: false
                });

                this.employees = [];
                this.schools = [];
                this.classrooms = [];
                this.assignments = [];
                
            }

        });

    }


    updateEmpSchFromDatabase(){
        //Update employees, then schools, then classrooms, then initialize emp and sch states
        this.employees = [];

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
            }).then(() => {
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
                    }).then(() => {
                        
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

                                        //Find the relative school
                                        //iterate the schools
                                        this.schoolIndex = this.schools.indexOf(this.schools.find(
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


                    })//schools.then

            })//employees.then

    }//updateEmpSchFromDatabase




    /**********************
     * Employee Functions 
     * *******************/

    setShowToEmployees(){
        //Runs when the Employees menu button is pressed
        this.setState({ empShow: {}, showing: "employees" });  
        
    }


    createEmployeeList(employee){
        return  <li  key={employee.key}>
                    <div>
                        <button className="delete" onClick={() => this.deleteEmployee(employee) }>&times;</button>
                        <button className="listedEmployee" 
                                onClick={() => this.setEmployeeToShowInMainArea(employee) } 
                                style={this.setSelectedStyle(employee.key)}
                                >
                            {employee.Name}
                        </button>
                    </div>
                </li>
    }


    setEmployeeToShowInMainArea(em){
        //Runs when an employee is selected from the list of employees
        this.setState({ empShow: em });

        this.empIndex = this.findIndexofObject(em)
    }


    updateTempEmployeeData(e){
        //Runs when an employee is being edited

        /*If the employee has not yet been flagged for saving, 
        then preserve data, initialize temp, set the flag and set the CSS mod*/
        if(this.needToSaveEmp === 0){             

            //Set the employee to update so changes are made to the temp, not the array or database
            this.tempEmpToUpdate.key = this.state.empShow.key;
            this.tempEmpToUpdate.Name = this.state.empShow.Name;
            this.tempEmpToUpdate.Priority= this.state.empShow.Priority;
            this.tempEmpToUpdate.FirstName=this.state.empShow.FirstName;
            this.tempEmpToUpdate.LastName=this.state.empShow.LastName;
            this.tempEmpToUpdate.Street1=this.state.empShow.Street1;
            this.tempEmpToUpdate.Street2=this.state.empShow.Street2;
            this.tempEmpToUpdate.City=this.state.empShow.City;
            this.tempEmpToUpdate.State=this.state.empShow.State;
            this.tempEmpToUpdate.Zip=this.state.empShow.Zip;
            this.tempEmpToUpdate.Address=this.state.empShow.Address;
            this.tempEmpToUpdate.NumAssignments=this.state.empShow.NumAssignments;
            this.tempEmpToUpdate.AvailableStart=this.state.empShow.AvailableStart;
            this.tempEmpToUpdate.AvailableEnd=this.state.empShow.AvailableEnd;
            this.tempEmpToUpdate.PseudoStart=this.state.empShow.PseudoStart;
            this.tempEmpToUpdate.PseudoEnd=this.state.empShow.PseudoEnd;
            
            //Set the flag for needing to update
            this.needToSaveEmp = 1;

            //Run CSS changes
            document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "HideLeftMenu");   
            document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "DiscardButtons");
            document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "SaveButtons");
            
        }

        
        switch(e.name){
            case "FirstName":
                this.tempEmpToUpdate.FirstName = e.value;
                this.tempEmpToUpdate.Name = this.tempEmpToUpdate.FirstName +" "+ this.tempEmpToUpdate.LastName;
                break;
            case "LastName":
                this.tempEmpToUpdate.LastName = e.value;
                this.tempEmpToUpdate.Name = this.tempEmpToUpdate.FirstName +" "+ this.tempEmpToUpdate.LastName;
                break;
            case "Street1":
                this.tempEmpToUpdate.Street1 = e.value;
                break;
            case "Street2":
                this.tempEmpToUpdate.Street2 = e.value;
                break;
            case "City":
                this.tempEmpToUpdate.City = e.value;
                break;
            case "State":
                this.tempEmpToUpdate.State = e.value;
                break;
            case "Zip":
                this.tempEmpToUpdate.Zip = e.value;
                break;
            case "AvailableStart":
                this.tempEmpToUpdate.AvailableStart = e.value;
                break;
            case "AvailableEnd":
                this.tempEmpToUpdate.AvailableEnd = e.value;
                break;
            case "Priority":
                this.tempEmpToUpdate.Priority = e.value;
                break;
            default:
                break;

        }

        this.tempEmpToUpdate.Address = 
            this.tempEmpToUpdate.Street1 + 
            this.tempEmpToUpdate.Street2 + ", " + 
            this.tempEmpToUpdate.City + ", " + 
            this.tempEmpToUpdate.State + " " + 
            this.tempEmpToUpdate.Zip;
        
        
        this.setState({ empShow: this.tempEmpToUpdate })
    }

    saveEmployeeChanges(){
        //Runs when the save button is pressed for an employee


        /*Save changes of the employee to the database and locally*/

        //If the employee needs to be saved, run
        if(this.needToSaveEmp === 1){

            //Save employee changes to the database
            firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees/' + this.tempEmpToUpdate.key).update({ 
                Name: this.tempEmpToUpdate.Name,
                Priority: this.tempEmpToUpdate.Priority,
                FirstName:this.tempEmpToUpdate.FirstName,
                LastName:this.tempEmpToUpdate.LastName,
                Street1:this.tempEmpToUpdate.Street1,
                Street2:this.tempEmpToUpdate.Street2,
                City:this.tempEmpToUpdate.City,
                State:this.tempEmpToUpdate.State,
                Zip:this.tempEmpToUpdate.Zip,
                Address:this.tempEmpToUpdate.Address,
                NumAssignments:this.tempEmpToUpdate.NumAssignments,
                AvailableStart:this.tempEmpToUpdate.AvailableStart,
                AvailableEnd:this.tempEmpToUpdate.AvailableEnd,
                PseudoStart:this.tempEmpToUpdate.PseudoStart,
                PseudoEnd:this.tempEmpToUpdate.PseudoEnd
            })

            //Save employee changes locally
            this.employees[this.empIndex].key = this.tempEmpToUpdate.key;
            this.employees[this.empIndex].Name = this.tempEmpToUpdate.Name;
            this.employees[this.empIndex].Priority= this.tempEmpToUpdate.Priority;
            this.employees[this.empIndex].FirstName=this.tempEmpToUpdate.FirstName;
            this.employees[this.empIndex].LastName=this.tempEmpToUpdate.LastName;
            this.employees[this.empIndex].Street1=this.tempEmpToUpdate.Street1;
            this.employees[this.empIndex].Street2=this.tempEmpToUpdate.Street2;
            this.employees[this.empIndex].City=this.tempEmpToUpdate.City;
            this.employees[this.empIndex].State=this.tempEmpToUpdate.State;
            this.employees[this.empIndex].Zip=this.tempEmpToUpdate.Zip;
            this.employees[this.empIndex].Address=this.tempEmpToUpdate.Address;
            this.employees[this.empIndex].NumAssignments=this.tempEmpToUpdate.NumAssignments;
            this.employees[this.empIndex].AvailableStart=this.tempEmpToUpdate.AvailableStart;
            this.employees[this.empIndex].AvailableEnd=this.tempEmpToUpdate.AvailableEnd;
            this.employees[this.empIndex].PseudoStart=this.tempEmpToUpdate.PseudoStart;
            this.employees[this.empIndex].PseudoEnd=this.tempEmpToUpdate.PseudoEnd;



            //reset the temp Employee
            this.tempEmpToUpdate = {
                key: null,
                Name: null,
                Priority: null,
                FirstName: null,
                LastName: null,
                Street1: null,
                Street2: null,
                City: null,
                State: null,
                Zip: null,
                Address: null,
                NumAssignments: null,
                AvailableStart: null,
                AvailableEnd: null,
                PseudoStart: null,
                PseudoEnd: null
            }
        }

        //Reset bit flag on need to save and CSS
        this.needToSaveEmp = 0;

        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "");

        
        this.setState({ empShow: this.employees[this.empIndex] })
    }


    deleteEmployee(emp){
        /*Delete employee record on database*/
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees/' + emp.key).set(null)
        
        
        /* Delete employee record on local array*/
        //Find index of employee
        var index = this.findIndexofObject(emp);

        //Overwrite employee data at index with data from next record
        var i;
        for( i = index; i < this.employees.length - 1; i++){
            this.employees[i] = this.employees[i+1]
        }
        
        //Remove last employee record
        this.employees.pop();


        this.setState({ empShow: {} })
        
    }

    updateEmployeesFromDatabase(){
        //No current functionality. Built for future development
        this.employees = [];

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

        
    }

    discardEmployeeChanges(){
        //Runs when "disacard changes" button is pressed for an employee


        //Reset
        this.tempEmpToUpdate.key = null;
        this.tempEmpToUpdate.Name = null;
        this.tempEmpToUpdate.Priority= null;
        this.tempEmpToUpdate.FirstName=null;
        this.tempEmpToUpdate.LastName=null;
        this.tempEmpToUpdate.Street1=null;
        this.tempEmpToUpdate.Street2=null;
        this.tempEmpToUpdate.City=null;
        this.tempEmpToUpdate.State=null;
        this.tempEmpToUpdate.Zip=null;
        this.tempEmpToUpdate.Address=null;
        this.tempEmpToUpdate.NumAssignments=null;
        this.tempEmpToUpdate.AvailableStart=null;
        this.tempEmpToUpdate.AvailableEnd=null;
        this.tempEmpToUpdate.PseudoStart=null;
        this.tempEmpToUpdate.PseudoEnd=null;

        //Reset bit flag for needing to save employees
        this.needToSaveEmp = 0     

        //Reset CSS for saving security
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "");

        //Set the employee that's showing equal to the employee at the index
        this.setState({ empShow: this.employees[this.empIndex] })

    }
    /******End of Employees******/



    /****************
     School Functions
     ****************/

    setShowToSchools(){
        //Runs when the "school" menu button is selected
        this.setState({ schShow: {}, showing: "schools" });

    }

    createSchoolList(school){
        return  <li key={school.key}>
                    <div>
                        <button className="delete" onClick={() => this.deleteSchool(school) }>&times;</button>
                        <button className="listedSchool"
                                onClick={() => this.setSchoolToShowInMainArea(school) }
                                style={this.setSelectedStyle(school.key)}>
                            {school.Name}
                        </button>
                    </div>
                </li>
    }


    setSchoolToShowInMainArea(sc){
        //Runs when a school is selected from the list of schools

        this.schIndex = this.findIndexofObject(sc)
        this.setState({ schShow: sc, clsShow: {} });
    }


    updateSchoolData(e){
        //Runs when a user begins to make changes to a school
        
        /*If the user is updating the school,
        first check that the school needs to be preserved,
        then initialize data and preserve*/
        if(this.needToSaveSch === 0){
            //Flag the bit signalling we're changing data
            this.needToSaveSch = 1;


            //Create the temp school that needs to be modified
            this.tempSchToUpdate.Name = this.schools[this.schIndex].Name
            this.tempSchToUpdate.key = this.schools[this.schIndex].key
            this.tempSchToUpdate.Street1 = this.schools[this.schIndex].Street1
            this.tempSchToUpdate.Street2 = this.schools[this.schIndex].Street2
            this.tempSchToUpdate.City = this.schools[this.schIndex].City
            this.tempSchToUpdate.State = this.schools[this.schIndex].State
            this.tempSchToUpdate.Zip = this.schools[this.schIndex].Zip
            this.tempSchToUpdate.Address = this.schools[this.schIndex].Address
            this.tempSchToUpdate.Classrooms  = this.schools[this.schIndex].Classrooms
            this.tempSchToUpdate.ClassroomsAssigned = this.schools[this.schIndex].ClassroomsAssigned
            this.tempSchToUpdate.TotalClassrooms = this.schools[this.schIndex].TotalClassrooms


            //Modifiy the CSS
            document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "HideLeftMenu");
            document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "DiscardButtons");
            document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "SaveButtons");
            document.getElementsByClassName("HideClassDetail")[0].setAttribute("id", "HideClassDetail");

            if(!isUndefined(this.state.clsShow.key)){
                document.getElementsByClassName("SelectedClassDetails")[0].setAttribute("id", "SelectedClassDetails");
            }
            
        }

        //Change the temporary school
        switch(e.name){
            case "Name":
                this.tempSchToUpdate.Name = e.value;
                break;
            case "Principal":
                this.tempSchToUpdate.Principal = e.value;
                break;
            case "Street1":
                this.tempSchToUpdate.Street1 = e.value;
                break;
            case "Street2":
                this.tempSchToUpdate.Street2 = e.value;
                break;
            case "City":
                this.tempSchToUpdate.City = e.value;
                break;
            case "State":
                this.tempSchToUpdate.State = e.value;
                break;
            case "Zip":
                this.tempSchToUpdate.Zip = e.value;
                break;
            case "Classrooms":
                this.tempSchToUpdate.Classrooms = e.value;
                break;
            default:
                break;

        }

        //Update School Address
        this.tempSchToUpdate.Address = 
            this.tempSchToUpdate.Street1 + 
            this.tempSchToUpdate.Street2 + ", " + 
            this.tempSchToUpdate.City + ", " + 
            this.tempSchToUpdate.State + " " + 
            this.tempSchToUpdate.Zip;

        //State needs to be set to reload the component
        //The item that will now be show will be this.tempSchToUpdate
        this.setState({schShow: this.tempSchToUpdate })
    }

    saveSchoolChanges(){
        //Runs when the "Save changes" button is selected for a school


        //If we need to save then run the function
        if(this.needToSaveSch === 1){
            //Save temp school to the database
            firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/schools/' + this.tempSchToUpdate.key)
                .update({

                    Name: this.tempSchToUpdate.Name,
                    key: this.tempSchToUpdate.key,
                    Street1: this.tempSchToUpdate.Street1,
                    Street2: this.tempSchToUpdate.Street2,
                    City: this.tempSchToUpdate.City,
                    State: this.tempSchToUpdate.State,
                    Zip: this.tempSchToUpdate.Zip,
                    Address: this.tempSchToUpdate.Address,
                    ClassroomsAssigned: this.tempSchToUpdate.ClassroomsAssigned,
                    TotalClassrooms: this.tempSchToUpdate.TotalClassrooms
                })
                .then(() => {
                    //Update the classroom's school names
                    this.schools[this.schIndex].Classrooms.ClassroomList.forEach((cls) => {
                        //Update the name of the classroom in the school array
                        cls.SchoolName = this.tempSchToUpdate.Name

                        //Update the name of the classroom in the local classroom array
                        var localClassIndex = this.classrooms.indexOf(cls)

                        this.classrooms[localClassIndex].SchoolName = this.tempSchToUpdate.Name

                        //Update the name of the classroom in the database
                        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms/' + cls.key)
                            .update({
                                SchoolName: this.tempSchToUpdate.Name
                            })

                    })
                })
                .then(() => {
                    
                    //Save the temp school to the local array
                    this.schools[this.schIndex].Name = this.tempSchToUpdate.Name
                    this.schools[this.schIndex].key = this.tempSchToUpdate.key
                    this.schools[this.schIndex].Street1 = this.tempSchToUpdate.Street1 
                    this.schools[this.schIndex].Street2 = this.tempSchToUpdate.Street2
                    this.schools[this.schIndex].City = this.tempSchToUpdate.City 
                    this.schools[this.schIndex].State = this.tempSchToUpdate.State 
                    this.schools[this.schIndex].Zip = this.tempSchToUpdate.Zip 
                    this.schools[this.schIndex].Address = this.tempSchToUpdate.Address 
                    this.schools[this.schIndex].Classrooms = this.tempSchToUpdate.Classrooms 
                    this.schools[this.schIndex].ClassroomsAssigned = this.tempSchToUpdate.ClassroomsAssigned 
                    this.schools[this.schIndex].TotalClassrooms = this.tempSchToUpdate.TotalClassrooms 
                })
                .then(() => {
                    //Reset the temp school
                    this.tempSchToUpdate.Name= null
                    this.tempSchToUpdate.key= null
                    this.tempSchToUpdate.Street1= null
                    this.tempSchToUpdate.Street2= null
                    this.tempSchToUpdate.City= null
                    this.tempSchToUpdate.State= null
                    this.tempSchToUpdate.Zip= null
                    this.tempSchToUpdate.Address= null
                    this.tempSchToUpdate.Classrooms= null
                    this.tempSchToUpdate.ClassroomsAssigned= null
                    this.tempSchToUpdate.TotalClassrooms= null
                    

                    //Reset the school to save bit flag
                    this.needToSaveSch = 0;

                    //Reset the CSS
                    document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
                    document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "");
                    document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "");
                    document.getElementsByClassName("HideClassDetail")[0].setAttribute("id", "");

                    if(!isUndefined(this.state.clsShow.key)){
                        document.getElementsByClassName("SelectedClassDetails")[0].setAttribute("id", "");
                    }

                    //Set the changed school to show
                    this.setState({ schShow: this.schools[this.schIndex] })

                })//Final .then()
                
        }//if(this.needToSaveSch === 1)
    }//saveSchoolChanges()

    deleteSchool(sch){
        //Runs when the "X" next to a school is selected, indicating to delete it
        
        //Find index of school to delete
        var index = this.findIndexofObject(sch);


        /* Remove school from database*/
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/schools/' + sch.key).set(null)

        /*Delete all classrooms associated with the school*/
        var classroomsToDelete = [];

        //populate the classrooms to delete
        this.schools[index].Classrooms.ClassroomList.forEach((cls) =>{
            classroomsToDelete.push(cls)
        })

        //Remove the classroom from the database
        classroomsToDelete.forEach((cls) => {
            firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms/' + cls.key).set(null)
        })
        

        //Remove the classroom from the list of classrooms
        classroomsToDelete.forEach((clsD) => {
            //Find the index of the classroom to delete
            var clsIndexLocal = this.classrooms.indexOf(clsD);

            //Replace that classroom with the classroom at the end of the array
            this.classrooms[clsIndexLocal] = this.classrooms[this.classrooms.length - 1]

            //Remove the last classroom in the array
            this.classrooms.pop()
        })

        classroomsToDelete = [];


        //Overwrite school with schools at a higher array index
        var i;
        for( i = index; i < this.schools.length - 1; i++){
            this.schools[i] = this.schools[i+1]
        }
        
        //Remove the last school
        this.schools.pop();

        this.setState({ schShow: {}, clsShow: {} })

    }


    updateSchoolsFromDatabase(){
        //Not currently used. Built for future development
        /*
        This function selects all the school data from the database and updates it to the local array
        */


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
            }).then(() => {
                
                this.updateClassroomsFromDatabase()

            })

        
    }

    discardSchoolChanges(){
        //Runs when a user decides not to save changes that was made to a school


        //Reload the school that's showing into the local arrays

        //Reset the temp school
        this.tempSchToUpdate.Name= null
        this.tempSchToUpdate.key= null
        this.tempSchToUpdate.Street1= null
        this.tempSchToUpdate.Street2= null
        this.tempSchToUpdate.City= null
        this.tempSchToUpdate.State= null
        this.tempSchToUpdate.Zip= null
        this.tempSchToUpdate.Address= null
        this.tempSchToUpdate.Classrooms= null
        this.tempSchToUpdate.ClassroomsAssigned= null
        this.tempSchToUpdate.TotalClassrooms= null
        
        //Reset the need to update school bit
        this.needToSaveSch = 0     

        //Reset CSS
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardButtons")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveButtons")[0].setAttribute("id", "");
        document.getElementsByClassName("HideClassDetail")[0].setAttribute("id", "");

        if(!isUndefined(this.state.clsShow.key)){
            document.getElementsByClassName("SelectedClassDetails")[0].setAttribute("id", "");
        }

        //Reset the school thats showing
        this.setState({ schShow: this.schools[this.schIndex]  })




    }
    /******End of Schools******/ 



    /********************Classroom *****************/
    //Runs when a different classroom is selected
    selectClassroomInApp(myClass){

        
        this.clsIndexInSchool = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(
            this.schools[this.schIndex].Classrooms.ClassroomList.find(
                // eslint-disable-next-line array-callback-return
                (myIteratedObject) => {
                    if (myIteratedObject.key === myClass.key){
                        return myIteratedObject
                    }
                }
            )
        );

        var classToSetAsShow = this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool];

        this.setState({ clsShow: classToSetAsShow });
        
    }


    //Runs when any classroom data is updated
    //Update originates from App > MainDetails> ScholDetails > Label Input, myClass has a key, name, and value
    myClassDetailsApp(myClass){
        
        if(this.needToSaveCls === 0){

            //Set the ids for the changes to alert for saving
            this.needToSaveCls = 1;

            //Reset the temporary classroom to current classroom
            this.tempClsToUpdate.key= this.state.clsShow.key;
            this.tempClsToUpdate.schoolKey= this.state.clsShow.schoolKey;
            this.tempClsToUpdate.SchoolName= this.state.clsShow.SchoolName;
            this.tempClsToUpdate.Teacher= this.state.clsShow.Teacher;
            this.tempClsToUpdate.StartTime= this.state.clsShow.StartTime;
            this.tempClsToUpdate.EndTime= this.state.clsShow.EndTime;
            this.tempClsToUpdate.Assigned= this.state.clsShow.Assigned;
            this.tempClsToUpdate.Name= this.state.clsShow.Name

            

            //Save the index of the classroom in the classroom array
            this.clsIndexInClassrooms = this.classrooms.indexOf(this.state.clsShow)
        }
            
            //var schoolToUpdate = this.state.schShow;
            
            //Find the index of the classroom in the school's list of classrooms
            /*
            var classroomIndex = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(
                this.schools[this.schIndex].Classrooms.ClassroomList.find(
                    // eslint-disable-next-line array-callback-return
                    (myIteratedObject) => {
                        if (myIteratedObject.key === myClass.key){
                            return myIteratedObject
                        }
                    }
                )
            );
            */


            switch(myClass.name) {
                case "Teacher":
                    this.tempClsToUpdate.Teacher = myClass.value;
                    break;
                case "StartTime":
                    this.tempClsToUpdate.StartTime = myClass.value;
                    break;
                case "EndTime":
                    this.tempClsToUpdate.EndTime = myClass.value;
                    break;
                default:

            }


            if(this.tempClsToUpdate.StartTime > 0 &&
                this.tempClsToUpdate.EndTime > 0){

                    this.tempClsToUpdate.Name = 
                        (this.tempClsToUpdate.Teacher + ": " +
                        this.tempClsToUpdate.StartTime + " - " + this.tempClsToUpdate.EndTime)
            }else {
                this.tempClsToUpdate.Name = this.tempClsToUpdate.Teacher
            }
            
            console.log(this.tempClsToUpdate.key)
            this.setState({ clsShow: this.tempClsToUpdate });



    }//myClassDetailsApp

    addClassroom(){
        //Runs when a user selects to add a new classroom in the "SchoolDetails.js"

        //Create a reference for a new classroom in the database
        var classKey = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms').push().key
        
        //Define Classroom
        this.newClassroom = {
            key: classKey,
            schoolKey: this.state.schShow.key,
            SchoolName: this.state.schShow.Name,
            Teacher: "Classroom " + (this.state.schShow.Classrooms.ClassroomList.length + 1),
            StartTime: 0,
            EndTime: 0,
            Assigned: 0,
            Name: "Classroom " + (this.state.schShow.Classrooms.ClassroomList.length + 1)
        }


        //Populate the classroom in the database
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms/' + classKey)
            .update({
                key: this.newClassroom.key,
                schoolKey: this.newClassroom.schoolKey,
                SchoolName: this.newClassroom.SchoolName,
                Teacher: this.newClassroom.Teacher,
                StartTime: this.newClassroom.StartTime,
                EndTime: this.newClassroom.EndTime,
                Assigned: this.newClassroom.Assigned,
                Name: this.newClassroom.Name
            })

        //Add the classroom to the local array of classrooms
        this.classrooms.push(this.newClassroom);

        this.clsIndexInClassrooms = this.classrooms.indexOf(this.newClassroom);
        
        //Update the school thats showing with the new classroom
        this.schools[this.schIndex].Classrooms.ClassroomList.push(this.newClassroom);

        this.clsIndexInSchool = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(this.newClassroom);

        
        //Update the classroom that's showing
        this.setState({ clsShow: this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool] });
        
            
    }

    deleteClassroom(cls){
        //Runs when a user deletes a classroom from the list of classes

        //Delete local classroom
        
        //Find the index of the classroom in the school's classroom list
        var classroomIndex = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(
            this.schools[this.schIndex].Classrooms.ClassroomList.find(
                // eslint-disable-next-line array-callback-return
                (myIteratedObject) => {
                    if (myIteratedObject.key === cls.key){
                        return myIteratedObject
                    }
                }
            )
        );

        //Overwrite the classroom data from the schools list
        var i;
        for( i = classroomIndex; i < this.schools[this.schIndex].Classrooms.ClassroomList.length - 1; i++){
            this.schools[this.schIndex].Classrooms.ClassroomList[i] = this.schools[this.schIndex].Classrooms.ClassroomList[i+1]
        }
        
        this.schools[this.schIndex].Classrooms.ClassroomList.pop();



        //Overwrite the classroom from the local classroom array
        var clsIndexLocal = this.classrooms.indexOf(cls);

        for(i = clsIndexLocal; i < this.classrooms.length - 1; i++){
            this.classrooms[i] = this.classrooms[i+1];
        }
        this.classrooms.pop();
        


        //Delete classroom from database
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms/' + cls.key).set(null)
        
        
        
        //Set the class to show based on the list of the school's classrooms
        this.setState({ clsShow: {} })
        
    }

    updateClassroomsFromDatabase(){
        //Not currently used. Built for future development


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

                        //Find the relative school
                        //iterate the schools
                        this.schoolIndex = this.schools.indexOf(this.schools.find(
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
            })

        
    }

    saveClassroomChanges(){
        //Runs when a user selects to save the changes made to a classroom's details

        //Update classroom in database
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/classrooms/' + this.tempClsToUpdate.key).update({
            key: this.tempClsToUpdate.key,
            schoolKey: this.tempClsToUpdate.schoolKey,
            SchoolName: this.tempClsToUpdate.SchoolName,
            Teacher: this.tempClsToUpdate.Teacher,
            StartTime: this.tempClsToUpdate.StartTime,
            EndTime: this.tempClsToUpdate.EndTime,
            Assigned: this.tempClsToUpdate.Assigned,
            Name: this.tempClsToUpdate.Name
        })

        //update classroom array in school list
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].key = this.tempClsToUpdate.key
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].schoolKey = this.tempClsToUpdate.schoolKey
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].SchoolName = this.tempClsToUpdate.SchoolName
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].Teacher = this.tempClsToUpdate.Teacher
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].StartTime = this.tempClsToUpdate.StartTime
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].EndTime = this.tempClsToUpdate.EndTime
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].Assigned = this.tempClsToUpdate.Assigned
        this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool].Name = this.tempClsToUpdate.Name

        //Udate classroom in local classroom array
        this.classrooms[this.clsIndexInClassrooms].key = this.tempClsToUpdate.key
        this.classrooms[this.clsIndexInClassrooms].schoolKey = this.tempClsToUpdate.schoolKey
        this.classrooms[this.clsIndexInClassrooms].SchoolName = this.tempClsToUpdate.SchoolName
        this.classrooms[this.clsIndexInClassrooms].Teacher = this.tempClsToUpdate.Teacher
        this.classrooms[this.clsIndexInClassrooms].StartTime = this.tempClsToUpdate.StartTime
        this.classrooms[this.clsIndexInClassrooms].EndTime = this.tempClsToUpdate.EndTime
        this.classrooms[this.clsIndexInClassrooms].Assigned = this.tempClsToUpdate.Assigned
        this.classrooms[this.clsIndexInClassrooms].Name = this.tempClsToUpdate.Name


        //Reset the tempclassroom
        this.tempClsToUpdate.key= null
        this.tempClsToUpdate.schoolKey= null
        this.tempClsToUpdate.SchoolName= null
        this.tempClsToUpdate.Teacher= null
        this.tempClsToUpdate.StartTime= null
        this.tempClsToUpdate.EndTime= null
        this.tempClsToUpdate.Assigned= null
        this.tempClsToUpdate.Name= null

        this.needToSaveCls = 0;

        this.setState({ clsShow: this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool] })

    }

    discardClassroomChanges(){
        //Runs when a user selects to "discard changes" made to a classroom


        //Reset temp class
        this.tempClsToUpdate.key= null;
        this.tempClsToUpdate.schoolKey= null;
        this.tempClsToUpdate.SchoolName= null;
        this.tempClsToUpdate.Teacher= null;
        this.tempClsToUpdate.StartTime= null;
        this.tempClsToUpdate.EndTime= null;
        this.tempClsToUpdate.Assigned= null;
        this.tempClsToUpdate.Name= null;


        this.needToSaveCls = 0;

        this.setState({ clsShow: this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool] })
    }
    /******************** End Classroom *****************/



    /************Assignments*******************/


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


        
        if (this.employees.length > 0 && this.schools.length > 0 
            && emptyEmpAddress === 0 && emptySchAddress === 0 && emptyClassSchedule ===  0){
            
            //Add up all the classrooms
            this.totalClassrooms = 0;
            
            this.schools.forEach((sch) => {
                this.totalClassrooms = this.totalClassrooms + sch.Classrooms.ClassroomList.length
            })

            //If there are classrooms to create assignments for, create assignments
            if (this.totalClassrooms > 0 ){
                /////////// Reset and clear ///////////
                
                //Clear Assignments
                this.assignments = [];
                this.listToShow = [];
                

                //Reset number of assigned classroom
                //Order classrooms from earliest to latest
                //Set each classroom as not assigned
                this.schools.forEach((sch) => {
                    //Reset number of assigned classrooms
                    sch.ClassroomsAssigned = 0;

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
                });


                //Reset all employees pseudo availability
                //and empty assignments[]
                this.employees.forEach((emp) => {
                    emp.PseudoStart = emp.AvailableStart;
                    emp.PseudoEnd = emp.AvailableEnd;
                    emp.Assignment = [];
                    
                });


                //Empty the list of distances for each employee to the school
                this.empschDistance = [];

                this.setState({ showing: "assignments" });
                /////////// Reset and clear end /////////////



                //Set max number for employee assignments to assign
                var maxAssignments = 0;
                this.schools.forEach((sch) => {
                    maxAssignments = maxAssignments + sch.Classrooms.ClassroomList.length
                });

                maxAssignments = maxAssignments/this.employees.length;


                //For each employee, check the distance to each school
                //then add a distance object to empschoolDistance[]
                //await new Promise(() => {

                this.employees.forEach((emp) => {

                    this.schools.forEach((sch) => {
                        this.addEmpSchDistanceObject(emp, sch);
                        
                    })

                })

                

                var iteratorForDistance = 0;
                
                    // Loop through each EmpSchDistance object and provide distance data
                    this.empschDistance.forEach((dist) => {

                        this.distance = 0;

                        var service = new window.google.maps.DistanceMatrixService();

                        // eslint-disable-next-line no-loop-func
                        service.getDistanceMatrix({
                                origins: [dist.employeeAddress],
                                destinations: [dist.schoolAddress],
                                travelMode: 'DRIVING',
                                unitSystem: window.google.maps.UnitSystem.IMPERIAL
                            // eslint-disable-next-line no-loop-func
                            }, (response, status) => {
                                
                                if (status === 'OK') {
                                    
                                    //Reset the distance
                                    this.distance = 0;
                
                                    //Get distance and duration from Google
                                    var results = response.rows[0].elements;
                                    var element = results[0];
                                    this.distance = parseFloat(element.distance.text);
                                    this.duration = parseFloat(element.duration.text);
                                    //var from = origins[i];
                                    //var to = destinations[j];

                                    //
                                    this.empschDistance[iteratorForDistance].distance = this.distance;
                                    this.empschDistance[iteratorForDistance].duration = this.duration;

                                    iteratorForDistance = iteratorForDistance +1;
                                    
                                
                                    //When we process the last empschDistance object, sort then assign
                                    if(this.empschDistance[this.empschDistance.length - 1].distance > 0 ){

                                        /*Sort the list of distances:
                                        by employee priority (Highest Priority comes first), 
                                        then by distance (Lowest Distance comes first)
                                        */
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


                                        /*
                                        For each empschDistance object, 
                                        find the school in the schools[] array,
                                        find the employee in the employees[],
                                        Test the employee's schedule against the school's classrooms,

                                        */
                                        this.empschDistance.forEach((dist) => {

                                            //Find the index of the distance object's school
                                            var indexOfSchool = this.schools.indexOf(
                                                this.schools.find(
                                                    // eslint-disable-next-line array-callback-return
                                                    (myIteratedObject) => {
                                                        if (dist.schoolKey === myIteratedObject.key){
                                                            return myIteratedObject;
                                                        }
                                                    }   
                                                )
                                            )


                                            var indexOfEmployee = this.employees.indexOf(
                                                this.employees.find(
                                                    // eslint-disable-next-line array-callback-return
                                                    (myIteratedObject) => {
                                                        if (dist.employeeKey === myIteratedObject.key){
                                                            return myIteratedObject;
                                                        }
                                                    }   
                                                )
                                            )

                                            
                                            //Test the employee's schedule against the school's classrooms
                                            //and assign the employee to the classroom if the schedule fits
                                            this.schools[indexOfSchool].Classrooms.ClassroomList.forEach((cl) =>{
                   
                                                if (cl.Assigned === 0 && 
                                                    this.employees[indexOfEmployee].Assignment.length <= maxAssignments &&
                                                    Number( cl.StartTime ) >= Number( this.employees[indexOfEmployee].PseudoStart ) && 
                                                    Number( cl.EndTime ) <= Number( this.employees[indexOfEmployee].PseudoEnd ) ){
                                                        //Set classroom as assigned
                                                        cl.Assigned = 1;
                                                        
                                                        //Add classroom to employee list of assignments
                                                        this.employees[indexOfEmployee].Assignment.push(cl);

                                                        //Reset Employee availability
                                                        this.employees[indexOfEmployee].PseudoStart = cl.EndTime;

                                                        
                                                        //Add classroom to list of general assignments
                                                        this.addAssignment(this.employees[indexOfEmployee],this.schools[indexOfSchool], cl, dist);

                                                        //Increase the schools.ClassroomAssigned int
                                                        this.schools[indexOfSchool].ClassroomsAssigned = this.schools[indexOfSchool].ClassroomsAssigned + 1;
                                                }//if (cl.Assigned === 0...
                                                
                                            })//this.schools[indexOfSchool].Classrooms.ClassroomList.forEach



                                        }) //this.empschDistance.forEach()

                                        this.loadClassesNoAsn();

                                        this.setShowToAssignments();


                                        
                                        
                                    }//if last empschDistance object has been given a distance
                                
                                }//if (status === 'OK')

                            }//(response, status)
                            
                        )//service.getDistanceMatrix
                        

                    })//this.empschDistance.forEach


            }//if (this.employees.length > 0 && this.schools.length > 0)

        }
        
    }//createAssignments End
    
    loadClassesNoAsn(){
        this.listClassNoAsn = []

        this.schools.forEach((sch) => {
            sch.Classrooms.ClassroomList.forEach((cls) => {
                if(cls.Assigned === 0){
                    this.listClassNoAsn.push(cls);
                }
            })
        })
    }

    addEmpSchDistanceObject(e, s){
        var newDistance = {
            distance: 0,
            duration: 0,
            employeeKey: e.key,
            employeeAddress: e.Address,
            employeePriority: e.Priority,
            schoolKey: s.key,
            schoolAddress: s.Address
        }

        this.empschDistance.push(newDistance);
    }


    //supply keys of the employee, school and classroom
    addAssignment(e,s, c, d){
        var newAssignment={
            key: Math.random() * 10000000000000000,
            Name: e.Name + " | " + s.Name + " | " + c.Teacher,
            Distance: d.distance,
            Duration: d.duration,
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

        this.assignments.push(newAssignment);
    }
    

    setShowToAssignments(){
        this.setState({ empShow: {}, schShow: {}, showing: "assignments"});

    }


    createAssignmentList(assignment){
        return  <li key={assignment.key}>
                    <button className="AsnList"
                            onClick={() => this.setAssignmentToShowInMainArea(assignment) }
                            style={this.setSelectedStyle(assignment.key)}>
                        {assignment.Name}
                    </button>
                </li>
    }

    createNoAssignmentList(cls){
        return  <li key={cls.key}>
                    <button className="NoAsnList" 
                            type="button">
                        {cls.SchoolName + ": " + cls.Teacher}
                    </button>
                </li>
    }


    setAssignmentToShowInMainArea(asn){
        this.setState({ asnShow: asn });
    }
    
    /************End of Assignments*******************/



    /*************Helper Functions  ******************/
    findIndexofObject(e){
        var indexOfItem;

        if ( this.state.showing === "employees"){
            indexOfItem = this.employees.indexOf(
                this.employees.find(
                    // eslint-disable-next-line array-callback-return
                    (myIteratedObject) => {
                        if (e.key === myIteratedObject.key){
                            return myIteratedObject;
                        }
                    }   
                )
            )
            
        }
        
        
        if ( this.state.showing === "schools"){
            indexOfItem = this.schools.indexOf(
                this.schools.find(
                    // eslint-disable-next-line array-callback-return
                    (myIteratedObject) => {
                         if (e.key === myIteratedObject.key){
                            return myIteratedObject;
                        }
                    }   
                )
            )
        
        }

        return indexOfItem;
    } //findIndexofObject



    setEventApp(e){
        
        if (this.state.showing === "employees"){
            //Update data of employee showing
            this.updateTempEmployeeData(e);

        }else if (this.state.showing === "schools"){
            //Update data of school showing
            this.updateSchoolData(e);
        }

    }

    returnQuickAdd(){
        switch(this.state.showing){
            case "employees":

                return (
                        <form onSubmit={this.add} className="quickFormEmp">
                            <div style={{ float: "Left", width: "16%", marginLeft: "4%" }}>Name</div>
                            <input 
                                type="text"
                                style={{ float: "Left", width: "78%" }}
                                ref={(a) => this._inputElement = a}
                                placeholder={" " +  this.state.showing}>
                            </input>

                            <button 
                                style={{ float: "Left", width: "80%", marginTop: "20px", marginLeft: "10%" }}
                                className="Add"
                                type="submit">add {this.state.showing}</button>
                        </form>
                    
                );
            
            case "schools":
                return (
                    <form onSubmit={this.add} className="quickFormSch">
                        <div style={{ float: "Left", width: "16%", marginLeft: "4%" }}>Name</div>
                        <input 
                            type="text"
                            style={{ float: "Left", width: "78%" }}
                            ref={(a) => this._inputElement = a}
                            placeholder={" " + this.state.showing}>
                        </input>

                        <button 
                            style={{ float: "Left", width: "80%", marginTop: "20px",  marginLeft: "10%" }}
                            className="Add"
                            type="submit">add {this.state.showing}</button>
                    </form>
                );


            case "assignments":
                return (
                    <form className="quickFormAsn" >
                        <button 
                                style={{ float: "Left", width: "80%", marginBottom: "20px", marginLeft: "10%" }}
                                className="Add"
                                type="button"
                                onClick={this.createAssignments}>create assignments</button>
                    </form>
                );


            default:
                
        }//switch(this.state.showing)

    } //returnQuickAdd


    add(e) {
        if (this._inputElement.value !== "" && this._inputElement.value !== "") {
            var nameElement = this._inputElement.value.split(" ");
            var firstNameElement = nameElement[0];
            var lastNameElement = nameElement[1];


            if (this.state.showing === "employees") {

                

                //Create a new database employee object and save the key of that object
                var empKey = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees').push().key
                
                //Set the name values and key of the local employee object
                this.newEmployee = {
                    Name: this._inputElement.value,
                    key: empKey,
                    Priority: 0,
                    FirstName: firstNameElement,
                    LastName: lastNameElement || "",
                    Street1: "",
                    Street2: "",
                    City: "",
                    State: "",
                    Zip: "",
                    Address: "",
                    NumAssignments: 0,
                    AvailableStart: "0700",
                    AvailableEnd: "1700",
                    PseudoStart: "0700",
                    PseudoEnd: "1700"
                };

                //Update the database employee object with the local employee object data
                firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees/' + empKey)
                    .update({

                        Name: this.newEmployee.Name,
                        key: this.newEmployee.key,
                        Priority: this.newEmployee.Priority,
                        FirstName: this.newEmployee.FirstName,
                        LastName: this.newEmployee.LastName,
                        Street1: this.newEmployee.Street1,
                        Street2: this.newEmployee.Street2,
                        City: this.newEmployee.City,
                        State: this.newEmployee.State,
                        Zip: this.newEmployee.Zip,
                        Address: this.newEmployee.Address,
                        NumAssignments: this.newEmployee.NumAssignments,
                        AvailableStart: this.newEmployee.AvailableStart,
                        AvailableEnd: this.newEmployee.AvailableEnd,
                        PseudoStart: this.newEmployee.PseudoStart,
                        PseudoEnd: this.newEmployee.PseudoEnd

                    });

                
                
                //Update employees[]
                this.employees.push(this.newEmployee)
                
                this.empIndex = this.employees.length - 1

                //Set the new employee object as the employee to show in main automatically
                this.setState({empShow: this.newEmployee});
                
                //Do not refresh the application
                e.preventDefault();

            }//add.if.ifEmployees end


            if (this.state.showing === "schools"){

                //Create a new database school object and save the key of that object
                var schKey = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/schools').push().key


                this.newSchool = {
                    Name: this._inputElement.value,
                    key: schKey,
                    Street1: "",
                    Street2: "",
                    City: "",
                    State: "",
                    Zip: "",
                    Address: "",
                    Classrooms: {key: 0,
                                ClassroomList: []
                                },
                    ClassroomsAssigned: 0,
                    TotalClassrooms: 0
                };
                
                //this.newSchool.Classrooms.key = this.newSchool.key;

                //Add school to local school array
                this.schools.push(this.newSchool)

                this.schIndex = this.schools.length - 1

                this.setState({schShow: this.schools[this.schIndex], clsShow: {} });

                //Update school data in to database
                firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/schools/' + schKey)
                    .update({

                        Name: this.newSchool.Name,
                        key: this.newSchool.key,
                        Street1: this.newSchool.Street1,
                        Street2: this.newSchool.Street2,
                        City: this.newSchool.City,
                        State: this.newSchool.State,
                        Zip: this.newSchool.Zip,
                        Address: this.newSchool.Address,
                        ClassroomsAssigned: 0,
                        TotalClassrooms: 0
                    });


            }//add.if.ifSchools end
            
        }//add.if() end

        this._inputElement.value = "";
        
        e.preventDefault();
    }


    
    setSelectedStyle(K){
        //This function accents the selected listed employee, school, classroom, or assignment
        var styleSet = {};

        if(this.state.showing === "employees"){
            if(isUndefined(this.state.empShow.key)){
                styleSet = { 
                    Selected:{}
                }

            }
            if(this.state.empShow.key === null ){
                styleSet = { 
                    Selected:{}
                }

            }else if(this.state.empShow.key === K){
                styleSet = {
                    Selected:{
                        boxShadow: "0px 6px 8px 1px rgba(2,2,2,0.75)",
                        backgroundColor: "rgb(255,182,45)",
                        zIndex: 21,
                        position: "relative",
                        color: "black"
                    }
                }

                
            }
        }else if(this.state.showing === "schools"){
            if(isUndefined(this.state.schShow.key)){
                styleSet = { 
                    Selected:{}
                }

            }
            if(this.state.schShow.key === null ){
                styleSet = { 
                    Selected:{}
                }

            }else if(this.state.schShow.key === K){
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
        }else if(this.state.showing === "assignments"){
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
        }

        return styleSet.Selected
    }//setSelectedStyle

    /*************End Helper Functions  ******************/

    
    ApplicationToReturn(){
        if(this.state.loggedIn === false){
            return(<LoginForm /> );
        }else{
            return(
                <div>
                    {/* Return the header */}
                    <Header title={"Teaching Artist Matching Application"}/>

                    {/* Return the Menu buttons and list of related items */}
                    <div className="LeftMenu" >
                        
                        <div className="HideLeftMenu" />
                        <div>
                        
                            {/* Menu buttons */}   
                            <button className="showEmpButton" 
                                    onClick={() => this.setShowToEmployees()}>
                                        Employees
                            </button>

                            <button onClick={() => this.setShowToSchools()}
                                    className="showSchButton">
                                        Schools
                            </button>

                            <button onClick={() => this.setShowToAssignments()}
                                    className="showAssignmentsButton">
                                        Assignments
                            </button>


                            
                            {/* Return the quick add button relative to what is showing */}
                            {this.returnQuickAdd()}



                            {/* Return list of what is showing */}
                            <div style={{ margin: "0px" }}>
                                <ListMenu   listName={this.state.showing}
                                            list={this.listToShow} />
                            </div>



                            {/* When assignments are showing, return the list of classes without assignments */}
                            <div style={{ margin: "0px" }}>
                                <ListMenu   listName={this.state.showing}
                                            list={this.listClassNoAsnShow} />
                            </div>
                        </div>
                    </div>


                    {/* Return the details of the item selected from the list*/}
                    <div className="MainDetails">
                        <MainDetails    mainItem={this.iAmMain}
                                        myEventApp={this.setEventApp}
                                        showing={this.state.showing}
                                        listLength={this.listLength}
                                        myClassDetailsApp={this.myClassDetailsApp}
                                        addClassroom={this.addClassroom}
                                        classToShowApp={this.state.clsShow}
                                        selectClassroomInApp={this.selectClassroomInApp}
                                        deleteClassroom={this.deleteClassroom}
                                        saveEmployeeChanges={this.saveEmployeeChanges}
                                        saveSchoolChanges={this.saveSchoolChanges}
                                        saveClassroomChanges={this.saveClassroomChanges}

                                        discardEmployeeChanges={this.discardEmployeeChanges}
                                        discardSchoolChanges={this.discardSchoolChanges}
                                        discardClassroomChanges={this.discardClassroomChanges}
                                        />
                    </div>


                </div>
            );
        }

    }//ApplicationToReturn



    render() {

        if (this.state.showing === "employees"){
            //Generate visual list of employees
            this.listToShow = this.employees.map(this.createEmployeeList);


            //Update the object to show in the main area
            //If the employee that is showing requires saving,
            //only modify the temporary employee until saving occurs
            if(this.needToSaveEmp === 1){
                this.iAmMain = this.tempEmpToUpdate;
            }else{
                this.iAmMain = this.state.empShow;
            }

            //Reset Index
            this.schIndex = null;
            this.clsIndexInClassrooms = null;
            this.clsIndexInSchool = null;

            //Update length of employees
            this.listLength = this.employees.length;

            this.listClassNoAsnShow = [];

            //Add/remove id for highlighting menu button
            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "showSelected");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "");

        }



        if (this.state.showing === "schools"){
            this.listToShow = this.schools.map(this.createSchoolList);
            this.iAmMain = this.state.schShow;
            this.listLength = this.schools.length;
            this.listClassNoAsnShow = [];

            //Reset index items
            this.empIndex = null

            if(this.needToSaveSch === 1){
                this.iAmMain = this.tempSchToUpdate;
            }else{
                this.iAmMain = this.state.schShow;
            }


            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "showSelected");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "");
        }



        if (this.state.showing === "assignments"){
            this.listToShow = this.assignments.map(this.createAssignmentList);
            this.iAmMain = this.state.asnShow;
            this.listLength = this.assignments.length;
            this.listClassNoAsnShow = this.listClassNoAsn.map(this.createNoAssignmentList);

            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "showSelected");
        }



        if (this.state.showing === "welcome"){
            this.listToShow = [];
            this.iAmMain = {}
            this.listLength = 0;
            this.listClassNoAsnShow = [];
        }



        if (this.state.showing === "logIn"){
            this.listToShow = [];
            this.iAmMain = {}
            this.listLength = 0;
            this.listClassNoAsnShow = [];

            document.getElementsByClassName("showEmpButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showSchButton")[0].setAttribute("id", "");
            document.getElementsByClassName("showAssignmentsButton")[0].setAttribute("id", "");
        }



        //Return the application data
        return (this.ApplicationToReturn());
    }
}


export default App;
