import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useCookies } from "react-cookie";

import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";

const Completedworkoutform = () => {
  const [day, setDay] = useState("");
  const [availableDays, setAvailableDays] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [cookies] = useCookies(["authUser"]);
  const [workoutProgress, setWorkoutProgress] = useState([]);

  useEffect(() => {
    const fetchWorkoutInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/workoutinfos/${cookies.authUser}`
        );

        setWorkoutData(response.data.data);

        //use set ensuring no duplicated days, tacit protection against user having multiple days
        const daysFound = [...new Set(response.data.data.map((workout) => workout.day))];
        setAvailableDays(daysFound);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchWorkoutInfo();
  }, [cookies.authUser]);

  console.log(workoutData);

  const handleDayChange = (e) => {
    const selectedDay = e.target.value;
    setDay(selectedDay);
    setWorkoutProgress([]);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (workoutProgress.some((workout) => !workout.totalweightlifted || !workout.repscompleted)) {
      alert("You must fill in all fields in order to submit your progress!");
      return;
    }
  
    try {
      const workoutsAvailableForSelectedDay = workoutData.filter((workout) => workout.day === day);
  
      //keeps a promise of all the results before they are submitted to axios allowing multiple values to go through at once
      const responses = await Promise.all(workoutsAvailableForSelectedDay.map((workout, index) => axios.post('http://localhost:4000/exerciseprogress', {
        userid: cookies.authUser,
        userworkoutid: parseInt(workout.userworkoutid),
        routineexerciseid: parseInt(workout.routineexerciseid),
        totalweightlifted: parseInt(workoutProgress[index]?.totalweightlifted), 
        repscompleted: parseInt(workoutProgress[index]?.repscompleted), 
        timestamp: formattedTimestamp,
      })));
  
      console.log("Response", responses.map((response) => response.data));
    } catch (error) {
      console.log("Error:", error);
    }

    //userpoints system
    try {
      const secondResponse = await axios.post('http://localhost:4000/userpoints', {
      userid: cookies.authUser,
      earnedat: formattedTimestamp,
      });
  
      console.log('Response:' , secondResponse.data);
    } catch (error) {
      console.error('Error:' , error);
    }
    };
  


    //formatting the timestamp which is then further formatted on the back-end serverside
  const formattedTimestamp = new Date().toLocaleString("en-UK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });


  return (
    <div className="home">
      <header>
        <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="#home">Fitness-Future</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/login">Login</Nav.Link>
                <NavDropdown title="Fitness-Functions" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/createroutine">Create Routine</NavDropdown.Item>
                  <NavDropdown.Item href="/addworkouts">
                    Add workouts
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/addexercisestoroutine">
                    Customise Routines
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/leaderboard">
                    Leaderboard
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      <main>
        <Container>
          <Row className="px-4 my-5">
            <Col sm={7}>
              <Image src="https://picsum.photos/900/400" fluid rounded />
            </Col>
            <Col sm={5}>
              <h1 className="fw-bold">Select a Workout Routine for the Day</h1>
              <p className="mt-3 fw-light">
                Once you select a routine every exercise you have selected will be available for your completion.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="day">Select Day:</label>
                  <select
                    type="String"
                    id="day"
                    className="form-control"
                    value={day}
                    onChange={handleDayChange} 
                  >
                  {/* Maps through days and brings up the results in dropdown */}
                  <option value="">Select Day</option>
                  {availableDays.map((day) => (
                  <option key={day} value={day}>
                  {day}
                  </option>
                 ))}
                </select>
                </div>

                {day && (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Exercise Name</th>
                        <th>Working Weight</th>
                        <th>Working Set Reps</th>
                        <th>Total Weight Lifted</th>
                        <th>Total Reps Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* filters workout data and then maps through the filtered data indexing the results Sets the key as the index */}
                      {workoutData
                        .filter((workout) => workout.day === day)
                        .map((workout, index) => (
                          <tr key={index}>
                            <td>{workout.workoutname}</td>
                            <td>{workout.customliftweight}</td>
                            <td>{workout.customliftreps}</td>
                            <td>
                              <input
                                type="int"
                                className="form-control"
                                // Optional chaining deals with null values, sets the workoutProgress value to whatever is inputted, similar operation below
                                value={workoutProgress[index]?.totalweightlifted || ""}
                                onChange={(e) => {
                                  const updatedWorkoutProgress = [...workoutProgress];
                                  updatedWorkoutProgress[index] = {
                                    ...updatedWorkoutProgress[index],
                                    totalweightlifted: e.target.value,
                                  };
                                  setWorkoutProgress(updatedWorkoutProgress);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="int"
                                className="form-control"
                                value={workoutProgress[index]?.repscompleted || ""}
                                onChange={(e) => {
                                  const updatedWorkoutProgress = [...workoutProgress];
                                  updatedWorkoutProgress[index] = {
                                    ...updatedWorkoutProgress[index],
                                    repscompleted: e.target.value,
                                  };
                                  setWorkoutProgress(updatedWorkoutProgress);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                )}

                <Button type="submit" className="btn btn-primary">
                  Submit Progress
                </Button>
              </form>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default Completedworkoutform;
