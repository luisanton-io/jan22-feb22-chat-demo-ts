import { FormEvent, useEffect, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
} from 'react-bootstrap'
import { io } from 'socket.io-client'

// 1) establishing a connection
// 2) logging in sending our username and receiving confermation from the server ('loggedin')
// 3) partecipate to the conversation sending messages

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// socket is a REFERENCE to the established connection

const Home = () => {
  // every time the WS connection happens correctly, the server is going to emit us
  // an EVENT back: this initialization event is called 'connect'
  // so let's set up an event listener for listening on the 'connect' event from the server!

  // let's create a state variable for connecting the username input field
  const [inputUserName, setInputUserName] = useState('')

  // event listeners have to be set up JUST ONCE
  useEffect(
    () => {
      socket.on('connect', () => {
        console.log('connection with the server established!')
      })

      // the 'loggedin' event comes from the server when my username has been added
      // to the online users list correctly
      socket.on('loggedin', () => {
        // now I'm officially logged in!
        console.log(
          "the username has been sent successfully and now you're logged in!"
        )
      })
    },
    [
      // empty pair of brackets here because ALL my event listeners have to be set up
      // just once!
    ]
  )

  const sendUsername = (e: FormEvent) => {
    e.preventDefault()
    // now we're about to emit an event to the server, carrying our username
    socket.emit('setUsername', {
      username: inputUserName,
    })
    // the server code is already set up to listen for a 'setUsername' event
    // and grab the username property out of its payload
  }

  return (
    <Container fluid className="px-4 my-3">
      <Row style={{ height: '95vh' }}>
        {/* MAIN COLUMN */}
        <Col md={10} className="d-flex flex-column justify-content-between">
          {/* TOP SECTION: USERNAME INPUT FIELD */}
          <Form onSubmit={sendUsername}>
            <FormControl
              value={inputUserName}
              onChange={(e) => setInputUserName(e.target.value)}
              placeholder="Insert your username here..."
            />
          </Form>
          {/* MIDDLE SECTION: CHAT HISTORY */}
          <ListGroup>
            <ListGroup.Item>Blablabla</ListGroup.Item>
            <ListGroup.Item>Blablabla</ListGroup.Item>
            <ListGroup.Item>Blablabla</ListGroup.Item>
          </ListGroup>
          {/* BOTTOM SECTION: NEW MESSAGE INPUT FIELD */}
          <Form>
            <FormControl placeholder="Write a message here!" />
          </Form>
        </Col>
        {/* ONLINE USERS COLUMN */}
        <Col md={2} style={{ borderLeft: '1px solid black' }}>
          <div className="mb-3">CONNECTED USERS:</div>
          <ListGroup>
            <ListGroup.Item>user1</ListGroup.Item>
            <ListGroup.Item>user2</ListGroup.Item>
            <ListGroup.Item>user3</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
