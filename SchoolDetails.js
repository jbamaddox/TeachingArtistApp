import React, { Component } from "react";
import LabelInput from "./LabelInput";
import ListMenu from "./ListMenu";
import ItemLocation from "./ItemLocation";
import { isUndefined } from "util";

class SchoolDetails extends Component{
    constructor(props){
        super(props)

        
        //List of classrooms from the props
        this.relevantClassroomList=[];
        
        this.myEventDetails= this.myEventDetails.bind(this);
        this.addClassroom = this.addClassroom.bind(this);
        this.createClassroomList = this.createClassroomList.bind(this);
        this.selectClassroomToShow = this.selectClassroomToShow.bind(this);
        
        this.myClassDetails = this.myClassDetails.bind(this);
        this.showLabelInputs = this.showLabelInputs.bind(this);
        this.deleteClassroom = this.deleteClassroom.bind(this);

        this.saveSchoolChanges = this.saveSchoolChanges.bind(this)
        this.saveClassroomChanges = this.saveClassroomChanges.bind(this)

        this.schoolDetailForm = this.schoolDetailForm.bind(this);

        this.discardSchoolChanges = this.discardSchoolChanges.bind(this);
        this.discardClassroomChanges = this.discardClassroomChanges.bind(this);

    }


    discardSchoolChanges(){
        this.props.discardSchoolChanges()
    }

    myEventDetails(myEventObject){
        this.props.myEventMain(myEventObject)
    }


    addClassroom(e) {
        this.props.addClassroom();

        e.preventDefault();

    }


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
    }
    
    setSelectedStyle(K){
        //This function accents the listed classroom that's selected
        var styleSet ={};
        
        if(isUndefined(this.props.classToShowSD.key)){
            styleSet = { 
                Selected:{
                    boxShadow: "0px 0px 0px 0px rgba(2,2,2,0)"
                    
                }
            }

        }else if(this.props.classToShowSD.key === K){
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
        
    }
    

    selectClassroomToShow(Classroom){
        this.props.selectClassroomInMain(Classroom);
        this.setState({ classToShow: Classroom });
    }

    myClassDetails(myClassEventObject){
        //When the classroom details are changed send the changes up to Main > App 
        this.props.myClassDetailsMain(myClassEventObject);

        //Modify CSS to Notify that changes should be saved
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "HideLeftMenu");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "SaveClassroomButton");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "DiscardClassroomButton");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "HideSchoolDetail");

        //Reset the class thats showing to the class from the props
        //Even though class thats showing comes directly from the props, not the state item
        this.setState({ classToShow: this.props.classToShow })
    }

    deleteClassroom(cls){
        this.props.deleteClassroom(cls);
    }

    discardClassroomChanges(){
        this.props.discardClassroomChanges();

        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "");
    }



    showLabelInputs(cls){
        //This function shows the details of the selected classroom in LabelInputs for modification

        //If the school doesnt exist, then 
        //if(isUndefined(this.props.mainItem.key)){
        //    //If the school has no classrooms, map over classrooms and prepare the classroom details
        //    this.relevantClassroomList = this.props.mainItem.Classrooms.ClassroomList.map(this.createClassroomList)
        //}else{
        //    
        //}
        


        //If there are no classrooms,
        //
        if( isUndefined(this.props.classToShowSD.key) ){
            return(<div></div>)
        }else if( this.props.classToShowSD.key === null ){
            return(<div></div>)

        }else{
            
            return(
                <div >
                        <LabelInput myEvent={this.myClassDetails} 
                                    label="Teacher" 
                                    item={cls.Teacher} 
                                    itemKey={cls.key}/>

                        <LabelInput myEvent={this.myClassDetails} 
                                    label="StartTime" 
                                    item={cls.StartTime} 
                                    itemKey={cls.key}/>

                        <LabelInput myEvent={this.myClassDetails} 
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

        
        
    
    }

    saveSchoolChanges(){
        this.props.saveSchoolChanges()
    }

    saveClassroomChanges(){
        //Save changes to the classroom to the database
        document.getElementsByClassName("HideLeftMenu")[0].setAttribute("id", "");
        document.getElementsByClassName("SaveClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("DiscardClassroomButton")[0].setAttribute("id", "");
        document.getElementsByClassName("HideSchoolDetail")[0].setAttribute("id", "");

        this.props.saveClassroomChanges()
    }

    schoolDetailForm(){
        if(isUndefined(this.props.mainItem.key)){
            return(<div></div>)
        }else if(this.props.mainItem.key === null){
            return(<div></div>)
        }else{
            return(
                <form className="flex-container-school">
                    
                    <div className="HideSchoolDetail"></div>
                    <div className="HideClassDetail"></div>

                    <div className="SchoolDetail">
                        

                        <div style={{ textAlign: "center" }}><h2><b>School Details</b></h2></div>
                        <LabelInput myEvent={this.myEventDetails} label="Name" item={this.props.mainItem.Name} itemKey={this.props.mainItem.key}/>
                        <LabelInput myEvent={this.myEventDetails} label="Street1" item={this.props.mainItem.Street1} itemKey={this.props.mainItem.key}/>
                        <LabelInput myEvent={this.myEventDetails} label="Street2" item={this.props.mainItem.Street2} itemKey={this.props.mainItem.key}/>
                        <LabelInput myEvent={this.myEventDetails} label="City" item={this.props.mainItem.City} itemKey={this.props.mainItem.key}/>
                        <LabelInput myEvent={this.myEventDetails} label="State" item={this.props.mainItem.State} itemKey={this.props.mainItem.key}/>
                        <LabelInput myEvent={this.myEventDetails} label="Zip" item={this.props.mainItem.Zip} itemKey={this.props.mainItem.key}/>
                        
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

                        {/* Button to add a new classroom */}
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
                        <ItemLocation item={this.props.mainItem}/>
                    </div>


                    <div className="ClassDetail">

                        {/*Details of selected classroom*/}
                        {this.showLabelInputs(this.props.classToShowSD)}
                    </div>


                </form>

            );
        }
    }

    render(){
        
        if(this.props.mainItem.Classrooms != null){
            this.relevantClassroomList = this.props.mainItem.Classrooms.ClassroomList.map(this.createClassroomList)
        }

        return (this.schoolDetailForm());
    }

}

export default SchoolDetails;
