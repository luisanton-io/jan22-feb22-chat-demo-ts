import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
} from 'react-bootstrap'

const Home = () => {
  return (
    <Container fluid className="px-4 my-3">
      <Row style={{ height: '95vh' }}>
        {/* MAIN COLUMN */}
        <Col md={10} className="d-flex flex-column justify-content-between">
          {/* TOP SECTION: USERNAME INPUT FIELD */}
          <Form>
            <FormControl placeholder="Insert your username here..." />
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
