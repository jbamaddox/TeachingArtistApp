import React, { Component } from "react";
import LabelInput from "./LabelInput";
import ListMenu from "./ListMenu";
import ItemLocation from "./ItemLocation";
import { isUndefined } from "util";
import firebase from "firebase";

class SchoolDetails extends Component{
    constructor(props){
        super(props)


        this.state = {
            schShow: {}, 
            clsShow: {}
        }

        this.showSchoolDetails = this.showSchoolDetails.bind(this);

        /* Schools */
        this.newSchool = {};
        
        this._inputElement = null;
        this.schools = [];
        this.schoolListToShow = [];
        this.schIndex = null;
        this.schooListToShow = [];
        this.needToSaveSch = 0;

        this.add = this.add.bind(this);
        this.createSchoolList = this.createSchoolList.bind(this);
        this.deleteSchool = this.deleteSchool.bind(this);
        this.setSchoolToShowInMainArea = this.setSchoolToShowInMainArea.bind(this);
        this.setSchoolSelectedStyle = this.setSchoolSelectedStyle.bind(this);
        this.updateSchoolData = this.updateSchoolData.bind(this);
        
        
        /* Classrooms */
        this.classrooms = [];
        this.newClassroom = {};
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
        this.clsIndexInSchool = 0;
        this.clsShow = {};
        this.clsIndexInClassrooms = 0;
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
        this.totalClassrooms = 0;

        //List of classrooms from the props
        this.relevantClassroomList=[];
        
        //this.myEventDetails= this.myEventDetails.bind(this);
        this.addClassroom = this.addClassroom.bind(this);
        this.createClassroomList = this.createClassroomList.bind(this);
        this.selectClassroomToShow = this.selectClassroomToShow.bind(this);
        
        this.updateClassroomData = this.updateClassroomData.bind(this);
        this.showLabelInputs = this.showLabelInputs.bind(this);
        this.deleteClassroom = this.deleteClassroom.bind(this);

        this.saveSchoolChanges = this.saveSchoolChanges.bind(this)
        this.saveClassroomChanges = this.saveClassroomChanges.bind(this)

        this.schoolDetailForm = this.schoolDetailForm.bind(this);

        this.discardSchoolChanges = this.discardSchoolChanges.bind(this);
        this.discardClassroomChanges = this.discardClassroomChanges.bind(this);

    }


    //************Schools ************//
    //Create School
    returnQuickAdd(){
        return (

            <div className="quickFormSch">

                <div style={{ float: "Left", width: "16%", marginLeft: "4%" }}>Name</div>
                
                <input 
                    type="text"
                    style={{ float: "Left", width: "78%" }}
                    ref={(a) => this._inputElement = a}
                    placeholder={" New School's Name"}>
                </input>

                <button 
                    style={{ float: "Left", width: "80%", marginTop: "20px",  marginLeft: "10%" }}
                    className="Add"
                    type="button"
                    onClick={this.add}>Add School</button>

            </div>

        );
    }//returnQuickAdd
    

    add(e) {
        if (this._inputElement.value !== "" && this._inputElement.value !== " ") {

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
            //Update school data into database
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
            
        }//add.if() end

        this._inputElement.value = "";
        
        e.preventDefault();
    }//add

    createSchoolList(school){
        return  <li key={school.key}>
                    <div>
                        <button className="delete" onClick={() => this.deleteSchool(school) }>&times;</button>
                        <button className="listedSchool"
                                onClick={() => this.setSchoolToShowInMainArea(school) }
                                style={this.setSchoolSelectedStyle(school.key)}>
                            {school.Name}
                        </button>
                    </div>
                </li>
    }//createSchoolList


    setSchoolSelectedStyle(K){
        var styleSet = {};

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

        return styleSet.Selected
    }//setSchoolSelectedStyle 


    //Update School
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
    }//updateSchoolData


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
    }//saveSchoolChanges


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

    }//discardSchoolChanges


    //Delete School
    deleteSchool(sch){
        //Runs when the "X" next to a school is selected, indicating to delete it
        
        //Find index of school to delete
        var index = this.schools.indexOf(sch);

        

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

    }//deleteSchool


    setSchoolToShowInMainArea(sc){
        //Runs when a school is selected from the list of schools

        this.schIndex = this.schools.indexOf(sc)

        this.setState({ schShow: sc, clsShow: {} });
    }//setSchoolToShowInMainArea

  

    //********** Classroom **********//
    //**Create Classroom**//
    addClassroom(e) {
        
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
        

        e.preventDefault();

    }//addClassroom

    createClassroomList(Classroom){
        return  <li key={Classroom.key}>
                    <div>
                        <button className="listedClass"
                                onClick={() => this.selectClassroomToShow(Classroom) }
                                type="button"
                                style={this.setSelectedStyle(Classroom.key)}>
                            {Classroom.Name}
                        </button>                        
                        <button className="delete" type="button" onClick={() => this.deleteClassroom(Classroom) }>&times;</button>

                    </div>
                </li>
    }//createClassroomList
    
    
    setSelectedStyle(K){
        //This function accents the listed classroom that's selected
        var styleSet ={};

        
        if(isUndefined(this.state.clsShow.key)){
            styleSet = { 
                Selected:{
                    boxShadow: "0px 0px 0px 0px rgba(2,2,2,0)"
                    
                }
            }

        }else if(this.state.clsShow.key === K){
            styleSet = {
                Selected:{
                    boxShadow: "0px 6px 8px 2px rgba(2,2,2,0.5)",
                    backgroundColor: "rgb(255,182,45)",
                    zIndex: 21,
                    position: "relative",
                    color: "black"
                }
            }
        }

        
        return styleSet.Selected
        
    }//setSelectedStyle
    

    selectClassroomToShow(Classroom){
        this.clsIndexInSchool = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(Classroom);

        var classToSetAsShow = this.schools[this.schIndex].Classrooms.ClassroomList[this.clsIndexInSchool];

        
        this.setState({ clsShow: classToSetAsShow });
    }//selectClassroomToShow



    //**Update Classroom**//
    updateClassroomData(myClass){
        //When the classroom details are changed send the changes up to Main > App 

        
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


        //Modify CSS to Notify that changes should be saved
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "HideLeftMenu");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "SaveClassroomButton");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "DiscardClassroomButton");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "HideSchoolDetail");

        //Reset the class thats showing to the class from the props
        //Even though class thats showing comes directly from the props, not the state item
        this.setState({ clsShow: this.tempClsToUpdate })
    }//updateClassroomData


    saveClassroomChanges(){
        //Save changes to the classroom to the database
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "");

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

    }//saveClassroomChanges

    
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

        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "");
    }//discardClassroomChanges
    

    showLabelInputs(cls){

        //Verify that there is a classroom
        //If there is, show the details of it
        
        if( isUndefined(this.state.clsShow.key) ){
            return(<div></div>)
        }else if( this.state.clsShow.key === null ){
            return(<div></div>)
        }else{
            return(
                <div >
                        <LabelInput myEvent={this.updateClassroomData} 
                                    label="Teacher" 
                                    item={cls.Teacher} 
                                    itemKey={cls.key}/>

                        <LabelInput myEvent={this.updateClassroomData} 
                                    label="StartTime" 
                                    item={cls.StartTime} 
                                    itemKey={cls.key}/>

                        <LabelInput myEvent={this.updateClassroomData} 
                                    label="EndTime" 
                                    item={cls.EndTime} 
                                    itemKey={cls.key}/>

                    <button 
                        style={{ marginTop: "1%" }}
                        className="SaveClassroomButton"
                        type="button"
                        onClick={this.saveClassroomChanges}>Save Classroom Changes</button>

                    <button 
                        className="DiscardClassroomButton"
                        type="button"
                        onClick={this.discardClassroomChanges}>Discard Changes</button>

                </div>
            );
        }
    
    }//showLabelInputs



    //**Delete Classroom**//
    deleteClassroom(cls){

        //Runs when a user deletes a classroom from the list of classes

        //Delete local classroom
        
        //Find the index of the classroom in the school's classroom list
        var classroomIndex = this.schools[this.schIndex].Classrooms.ClassroomList.indexOf(cls);

        /*
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
        */

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
        
    }//deleteClassroom


    showSchoolDetails(){
        if (isUndefined(this.state.schShow.key)){
            return(<div></div>)
        }else{
            return(
                <form className="flex-container-school">
                    
                    <div className="HideSchoolDetail"></div>
                    <div className="HideClassDetail"></div>

                    <div className="SchoolDetail">


                        <div style={{ textAlign: "center" }}><br/><br/><h2><b>School Details</b></h2></div>
                        
                        <LabelInput myEvent={this.updateSchoolData} label="Name" item={this.state.schShow.Name} itemKey={this.state.schShow.key}/>
                        <LabelInput myEvent={this.updateSchoolData} label="Street1" item={this.state.schShow.Street1} itemKey={this.state.schShow.key}/>
                        <LabelInput myEvent={this.updateSchoolData} label="Street2" item={this.state.schShow.Street2} itemKey={this.state.schShow.key}/>
                        <LabelInput myEvent={this.updateSchoolData} label="City" item={this.state.schShow.City} itemKey={this.state.schShow.key}/>
                        <LabelInput myEvent={this.updateSchoolData} label="State" item={this.state.schShow.State} itemKey={this.state.schShow.key}/>
                        <LabelInput myEvent={this.updateSchoolData} label="Zip" item={this.state.schShow.Zip} itemKey={this.state.schShow.key}/>

                        <button 
                            style={{ marginTop: "15px" }}
                            className="SaveButtons"
                            type="button"
                            onClick={this.saveSchoolChanges}>Save School Changes</button>

                        <button 
                            className="DiscardButtons"
                            type="button"
                            onClick={this.discardSchoolChanges}>Discard Changes</button>

                    </div>


                    {/* List of clickable classrooms from the school */}
                    <div className="ClassDetail">

                        <div style={{ textAlign: "center" }}><h2><b>Classroom List</b></h2></div>

                        {/* Button to add a new classroom*/}
                        <button 
                            style={{ float: "Left", width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%"}}
                            className="Add"
                            onClick={this.addClassroom}
                            type="button">
                                Add New Classroom
                        </button>

                        <ListMenu   list={this.relevantClassroomList}/>

                    </div>


                    <div className="SchoolDetail">

                        {/* Map of  school*/}
                        <ItemLocation item={this.state.schShow}/>
                    </div>


                    <div className="ClassDetail">

                        {/*Details of selected classroom*/}
                        {this.showLabelInputs(this.state.clsShow)}

                    </div>


                </form>
            );
        }
    }//showSchoolDetails


    schoolDetailForm(){
        
            return(
                <div>

                    <div className="ListDiv" style={{ padding: "0", width: "25%", position: "absolute", left: "0", marginTop: "150px" }}>
                        {this.returnQuickAdd()}

                        <ListMenu   listName="schools"
                                    list={this.schoolListToShow} />
                                    
                    </div>
            
                    {this.showSchoolDetails()}

                </div>
            );
        
    }//schoolDetailForm


    render(){
        this.classrooms = this.props.sendClassroomsToSD
        this.schools = this.props.sendSchoolsToSD
        this.schoolListToShow = this.schools.map(this.createSchoolList);

        /**/
        if(this.state.schShow.Classrooms != null){
            this.relevantClassroomList = this.state.schShow.Classrooms.ClassroomList.map(this.createClassroomList)
        }else{
            this.relevantClassroomList = []
        }

        return (this.schoolDetailForm());
    }//render

}

export default SchoolDetails;
