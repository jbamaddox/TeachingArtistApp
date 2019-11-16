import React, { Component } from "react";
import LabelInput from "./LabelInput";
import ItemLocation from "./ItemLocation";
import { isUndefined } from "util";
import firebase from "firebase";
import ListMenu from "./ListMenu";

class EmployeeDetails extends Component{
    constructor(props){
        super(props)

        this.state = {
            employeesLoaded: false,
            empShow: {}
        }

        this.mainItem = {};
        

        this.employees = [];
        this.newEmployee = {};
        this.empIndex = null;
        this._inputElement = null;

        this.listToShow = [];
        this.createEmployeeList = this.createEmployeeList.bind(this);
        this.add = this.add.bind(this)

        //this.myEventDetails= this.myEventDetails.bind(this);
        this.updateTempEmployeeData = this.updateTempEmployeeData.bind(this);
        this.needToSaveEmp = 0;
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
        };


        this.setEmployeeToShow = this.setEmployeeToShow.bind(this);
        this.setSelectedStyle = this.setSelectedStyle.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this)
        this.saveEmployeeChanges = this.saveEmployeeChanges.bind(this);
        this.employeeForm = this.employeeForm.bind(this);
        this.discardEmployeeChanges = this.discardEmployeeChanges.bind(this);
    }


    createEmployeeList(employee){
        return  <li  key={employee.key}>
                    <div>
                        <button className="delete" onClick={() => this.deleteEmployee(employee) }>&times;</button>
                        <button className="listedEmployee" 
                                onClick={() => this.setEmployeeToShow(employee) } 
                                style={this.setSelectedStyle(employee.key)}
                                >
                            {employee.Name}
                        </button>
                    </div>
                </li>
    }//createEmployeeList


    deleteEmployee(emp){
        /*Delete employee record on database*/
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/employees/' + emp.key).set(null)
        
        
        /* Delete employee record on local array*/
        //Find index of employee
        var index = this.employees.indexOf(emp);

        //Overwrite employee data at index with data from next record
        var i;
        for( i = index; i < this.employees.length - 1; i++){
            this.employees[i] = this.employees[i+1]
        }
        
        //Remove last employee record
        this.employees.pop();


        this.setState({ empShow: {} })
        
    }//deleteEmployee


    setEmployeeToShow(em){
        //Runs when an employee is selected from the list of employees
        this.setState({ empShow: em });

        //this.empIndex = this.findIndexofObject(em)
        this.empIndex = this.employees.indexOf(em)
        
        
    }//setEmployeeToShow


    setSelectedStyle(K){
        //This function accents the selected listed employee, school, classroom, or assignment
        var styleSet = {};

        if(isUndefined(this.state.empShow.key)){
            styleSet = { 
                Selected:{}
            }
        }

        if(this.state.empShow.key === null ){
            styleSet = { 
                Selected:{}
            }
        }

        if(this.state.empShow.key === K){
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

            
        
        return styleSet.Selected
    }//setSelectedStyle


    updateEmployeesFromDatabase(){
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

                })//snapshot.forEach()
            })//once()
    }//updateEmployeesFromDatabase()


    add(e) {
        if (this._inputElement.value !== "" && this._inputElement.value !== " ") {
            var nameElement = this._inputElement.value.split(" ");
            var firstNameElement = nameElement[0];
            var lastNameElement = nameElement[1];


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

        }//add.if() end

        this._inputElement.value = "";
        
        e.preventDefault();
    }//add


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
    }//updateTempEmployeeData


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
    }//saveEmployeeChanges


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

    }//discardEmployeeChanges

    

    //*****Presentation Functions *****//
    returnQuickAdd(){
                return (

                    
                    <div className="quickFormEmp">
                        
                        <div style={{ float: "Left", width: "16%", marginLeft: "4%" }}>Name</div>

                        <input 
                            type="text"
                            style={{ float: "Left", width: "78%" }}
                            ref={(a) => this._inputElement = a}
                            placeholder={" New Employee's Name"}>
                        </input>

                        <button 
                            style={{ float: "Left", width: "80%", marginTop: "20px",  marginLeft: "10%" }}
                            className="Add"
                            type="button"
                            onClick={this.add}>Add Employee</button>


                    </div>
                    
                );

    }//returnQuickAdd


    employeeDetailsToShow(){
        if(isUndefined(this.mainItem.key)){
            return(<div></div>)
        }else if(this.mainItem.key === null){
            return(<div></div>)
        }else{
            return(
                <div className="flex-container-employee">

                    <div >
                        <div style={{ textAlign: "center" }}><h2><b>Employee Details</b></h2></div>
                        <form>
                            
                            <LabelInput myEvent={this.updateTempEmployeeData} label="FirstName" item={this.mainItem.FirstName} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="LastName" item={this.mainItem.LastName} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="Street1" item={this.mainItem.Street1} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="Street2" item={this.mainItem.Street2} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="City" item={this.mainItem.City} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="State" item={this.mainItem.State} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="Zip" item={this.mainItem.Zip} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="AvailableStart" item={this.mainItem.AvailableStart} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="AvailableEnd" item={this.mainItem.AvailableEnd} itemKey={this.mainItem.key}/>
                            <LabelInput myEvent={this.updateTempEmployeeData} label="Priority" item={this.mainItem.Priority} itemKey={this.mainItem.key}/>
                            
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

                    {/*  */}
                    <div>
                        <ItemLocation item={this.mainItem}/>
                    </div>
                    
                </div>
            )

        }
    }//employeeDetailsToShow


    employeeForm(){
        

        if(this.needToSaveEmp === 1){
            this.mainItem = this.tempEmpToUpdate;
        }else{
            this.mainItem = this.state.empShow;
        }

        
            return(
                
                <div>
                    
                    <div className="ListDiv" style={{ padding: "0", width: "25%", position: "absolute", left: "0", marginTop: "150px" }}>
                        {this.returnQuickAdd()}
                        
                        <ListMenu   listName="employees"
                                    list={this.listToShow} />
                    </div>

                    {this.employeeDetailsToShow()}
                    
                </div>
            );
        
    }//employeeForm

    
    render(){
        this.employees = this.props.sendEmployeesToED
        this.listToShow = this.employees.map(this.createEmployeeList);

        return (this.employeeForm());
    }

}

export default EmployeeDetails;
