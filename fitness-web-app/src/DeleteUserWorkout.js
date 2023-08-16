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
import Modal from 'react-bootstrap/Modal';


//use state to handle form setting variables
const DeleteUserWorkouts = () => {
  const [workoutid, setWorkoutID] = useState("");
  const [customliftweight, setCustomLiftWeight] = useState("");
  const [customliftreps, setCustomLiftReps] = useState("");
  const [workoutIds, setWorkoutIds] = useState([]);
  const [workoutNames, setWorkoutNames] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [cookies] = useCookies(["authUser"]);

  useEffect(() => {
    const fetchWorkoutIds = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/userworkouts/${cookies.authUser}`
        );
        console.log("Response:", response.data); // Log the response data

        const workoutIds = response.data.data.map(
          (workoutsavaiable) => workoutsavaiable.workoutid
        );

        const workoutNames = response.data.data.map(
          (workoutnamesavailable) => workoutnamesavailable.workoutname
        );
        console.log("Here are the workout ids:", workoutIds);
        setWorkoutIds(workoutIds);
        setWorkoutNames(workoutNames);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchWorkoutIds();
  }, [cookies.authUser]);

  const handleDelete = async (event) => {
    event.preventDefault();


    if (!workoutid) {
      alert("You need to select a workout to delete!")
      return;
    }


  try {
    const response = await axios.post('http://localhost:4000/deleteuserworkouts', {
    userid: cookies.authUser,
    workoutid: parseInt(workoutid),
    });
     console.log('Response:' , response.data);
  } catch (error) {
    console.error('Error:' , error);
  }
  };


  const confirmModal = (
    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this user workout? This will completely reset progress in this exercise.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
  


  return (
    <div className="home">
      <header>
      <Navbar
          expand="lg"
          Navbar bg="primary" 
          data-bs-theme="dark"
        >
          <Container>
            <Navbar.Brand href="#home">Fitness-Future</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/userhome">Home</Nav.Link>
                <Nav.Link href="/logout">Logout</Nav.Link>
                <NavDropdown title="Workout Management" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/createroutine">Create Routine</NavDropdown.Item>
                  <NavDropdown.Item href="/addworkouts">
                    Add user exercises
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/editworkouts">
                    Edit user exercises
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/addexercisestoroutine">
                    Customise Routines
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/resetprogress">Reset exercise progress</NavDropdown.Item>
                  <NavDropdown.Item href="/removeroutineexercise">
                    Delete exercise from routine
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/deleteworkoutroutine">
                    Delete routine
                  </NavDropdown.Item>
                  

                </NavDropdown>
                <Nav.Link href="/leaderboard">The Leaderboard</Nav.Link>
                <Nav.Link href="/exercisecompletion">Workout Record</Nav.Link>

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
              <h1 className="fw-bold">Remove a personal exercise</h1>
              <p className="mt-3 fw-light">
                If you no longer wish to work with this exercise then drop it! Be warned, you cannot delete an exercise without agreeing to reset your progress and removing it from your routines!
              </p>
              <form onSubmit={handleDelete}>
                <div className="mb-4">
                  <label htmlFor="workoutid">Workout:</label>
                  <select
                    type="String"
                    id="workoutid"
                    className="form-control"
                    value={workoutid}
                    onChange={(e) => setWorkoutID(e.target.value)}
                  >
                   <option value="">Select Workout</option>
                    {workoutIds.map((id, index) => (
                    <option key={id} value={id}>
                    {workoutNames[index]}
                    </option>
                    ))}
                </select>
                </div>
                <Button variant="danger" onClick={() => setShowConfirmModal(true)}>Delete User Workout</Button>
              </form>
            </Col>
          </Row>
        </Container>
      </main>
      {confirmModal}
    </div>
  );
};

export default DeleteUserWorkouts;