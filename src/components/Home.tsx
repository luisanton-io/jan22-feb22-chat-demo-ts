import { FormEvent, useEffect, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
  Button,
} from 'react-bootstrap'
import { io } from 'socket.io-client'
import { User } from '../typings/User'
import { Message } from '../typings/Message'

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
  const [loggedIn, setLoggedIn] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [room, setRoom] = useState<"blue" | "red">('blue')

  const getChatHistory = async () => {
    const response = await fetch(ADDRESS + '/rooms/' + room)
    const data = await response.json()
    setChatHistory(data)
  }

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
        setLoggedIn(true)
        getOnlineUsers()        
        // newConnection is an event sent automatically from the server
        // to all the clients that are ALREADY loggedin when a new user
        // logs in on its own
        socket.on('newConnection', () => {
          console.log('a new client just connected!')
          getOnlineUsers()
        })
        socket.on('message', (messageFromAnotherClient: Message) => {
          // this is for a connected client who receives a message from another user!
          // let's retrieve the message from the event and append it to chatHistory
          // setChatHistory([...chatHistory, messageFromAnotherClient]) // <-- this is a buggy line of code.
          // because this socket.on event listener is set-up just ONCE, in the beginning of the lifecycle,
          // chatHistory is NEVER re-evaluated! we need to evaluate chatHistory BEFORE appending our new message
          setChatHistory((currentChatHistory) => [
            ...currentChatHistory,
            messageFromAnotherClient,
          ]) // <-- this is a buggy line of code.
        })
        // newConnection works, but this should be enabled JUST when a user has already logged in!
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // empty pair of brackets here because ALL my event listeners have to be set up
      // just once!
    ]
  )

  useEffect(() => {
    //let's retrieve this rooms previous chat history from the server

    console.log("Room changed. Now it is ", room)
    socket.on('loggedin', getChatHistory)

    return () => {
      console.log("Room changing. It was ", room)
      socket.off('loggedin', getChatHistory)
    }
  }, [room])

  const sendUsername = (e: FormEvent) => {
    e.preventDefault()
    // now we're about to emit an event to the server, carrying our username
    socket.emit('setUsername', {
      username: inputUserName,
      room
    })
    // the server code is already set up to listen for a 'setUsername' event
    // and grab the username property out of its payload
  }

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log("let's send the message!")
    // let's send our message to the server through an event of type 'sendmessage'
    // how is a message looking like?
    const messageToSend: Message = {
      text: newMessage,
      sender: inputUserName,
      timestamp: Date.now(),
      id: socket.id
    }

    socket.emit('sendmessage', {message: messageToSend, room})
    // let's empty the input field
    setNewMessage('')
    // me, the sender of the message, doesn't need to receive the message from the server!
    // so I'll just append it to the end of my own chatHistory
    // all the other connected clients, they are going to receive the message
    // from the server
    setChatHistory([...chatHistory, messageToSend])
  }

  const getOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + '/online-users')
      if (response.ok) {
        let data = await response.json()
        console.log(data)
        // now let's save the users list in a state variable
        // so I can populate my interface, spec. the right column
        setOnlineUsers(data.onlineUsers)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const toggleRoom = () => {
    setRoom(room => room === "blue" ? "red" : "blue")
  }

  return (
    <Container fluid className="px-4 my-3">
      <Row style={{ height: '95vh' }}>
        {/* MAIN COLUMN */}
        <Col md={10} className="d-flex flex-column justify-content-between">
          {/* TOP SECTION: USERNAME INPUT FIELD */}
          <Form onSubmit={sendUsername} className="d-flex">
            <FormControl
              value={inputUserName}
              onChange={(e) => setInputUserName(e.target.value)}
              placeholder="Insert your username here..."
              disabled={loggedIn}
            />
            <Button
            className="ml-2"
            variant={
              room === "blue" ? "primary" : "danger"
            }
             onClick={toggleRoom}>
              Room
            </Button>
          </Form>
          {/* MIDDLE SECTION: CHAT HISTORY */}
          <ListGroup>
            {chatHistory.map((m, i) => (
              <ListGroup.Item
                key={i}
                style={{
                  color: 'white',
                  backgroundColor:
                    m.sender === inputUserName ? 'green' : 'blue',
                }}
              >
                {m.sender} - {m.text} |{' '}
                {new Date(m.timestamp).toLocaleTimeString('en-US')}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {/* BOTTOM SECTION: NEW MESSAGE INPUT FIELD */}
          <Form onSubmit={handleMessageSubmit}>
            <FormControl
              placeholder="Write a message here!"
              disabled={!loggedIn}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </Form>
        </Col>
        {/* ONLINE USERS COLUMN */}
        <Col md={2} style={{ borderLeft: '1px solid black' }}>
          <div className="mb-3">CONNECTED USERS:</div>
          <ListGroup>
            {onlineUsers
            .filter(u => u.room === room)
            .map((user) => (
              <ListGroup.Item key={user.socketId}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
