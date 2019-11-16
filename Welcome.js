import React, { Component } from "react";

class Welcome extends Component{
    render(){
        return (
            <div className="welcome">

                <h2 style={{ textAlign: "center" }}>Welcome to the Teaching Artist Matching Application</h2>

                <div style={{ textAlign: "left"}} >
                    This application matches employees (teaching artists) to the closest geographical school and assigns the teaching artist to the classroom.
                    <br /> <br /><br />

                    This is achieved by using the Google Maps API to find the closest teaching artist to a school's address (via driving directions). Here how it works: 
                    <br /><br />
                    <ul className="welcomeList" >
                        <li>First, select the "Employees" button to the left, enter the teaching artists, name, and select "add employees". You'll then be able to add the teaching artists details and save it to the Google Firebase database.</li>
                        <li>Next, select "Schools", and follow the same procedure, adding a school, classrooms, and their details</li>
                        <li>Once you have your Teaching Artist and School details enters, select "Assignments" and "Create Assignments" to view the best matches
                        </li>
                    </ul>

                </div>


                <br /><br />

                <h3>Things to make note of:</h3>

                <div>
                    <ul className="welcomeList" >
                        <li>All schedule/available start and end times must be entered in military time.. for now</li>
                        <li>An employee's priority (highest value has first dibs) gets them first in line to be assigned to the closest school to them.</li>
                        <li>When assignments are created, the classrooms not matched to a employee will be listed below the assignments</li>
                        
                    </ul>
                </div>
            </div>
        );
    }

}

export default Welcome;