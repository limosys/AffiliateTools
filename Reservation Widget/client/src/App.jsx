import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useRef } from 'react';
import DateTimePicker from 'react-datetime-picker';
import io from 'socket.io-client';
import {
  Form, Button, Card, Row, Col, CloseButton, InputGroup,
} from 'react-bootstrap';
// import DatalistInput from 'react-datalist-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
// import './datalist_styles.css';
import './DateTimePicker.css';
import './Calendar.css';
import './Clock.css';
import './styles.css';

// Connect to websocket server
const socket = io(process.env.REACT_APP_WS_URL);
// Main page function
function App() {
  const [dateTimeValue, setDateTimeChange] = useState(new Date());
  const [inputValues, setInputValues] = useState({
    pickup: '', dropoff: '',
  });
  const [passengerCountErr, setPassengerCountErr] = useState(false);
  const [pickupErr, setPickupErr] = useState(false);
  const [dropoffErr, setDdropoffErr] = useState(false);
  const passengerCountRef = useRef();
  const [currentInput, setCurrentInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const passengerCount = [];

  // Populate the passenger select options
  for (let i = 1; i <= 55; i += 1) {
    passengerCount.push(<option value={i} key={i}>{i}</option>);
  }

  // On page load => Connect websocket
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Websocket Connected');
    });
    socket.on('disconnect', () => {
      console.log('Websocket Disconnected');
    });
    // On websocket response.
    socket.on('suggestions', (res) => {
      console.log('websocket response', res);
      const suggestionArray = [];
      for (let i = 0; i < res.predictions.length; i += 1) {
        suggestionArray.push(res.predictions[i].description);
      }
      setSuggestions(suggestionArray);
      setShowSuggestions(true);
    });
    socket.on('error', (err) => {
      console.log('websocket error', err);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('suggestions');
      socket.off('error');
    };
  }, []);

  // function to handle option select
  async function handleOptionSelect(e) {
    setInputValues({ ...inputValues, [currentInput]: suggestions[e.currentTarget.value] });
  }

  // Function to handle clear input
  function handleClear(inputToClear) {
    setShowSuggestions(false);
    setInputValues({ ...inputValues, [inputToClear]: '' });
  }

  // Function to handle the input change
  // Need cleaning
  function inputChange(e, type) {
    if (type) {
      setCurrentInput(type);
      if (e.currentTarget.value.length > 1 && !suggestions.includes(e.currentTarget.value)) {
        socket.emit('query', e.currentTarget.value);
      } else {
        setShowSuggestions(false);
      }
      setInputValues({
        ...inputValues,
        [type]: e.currentTarget.value,
      });
    } else if (e === 'pickup') {
      setPickupErr(false);
    } else if (e === 'dropoff') {
      setDdropoffErr(false);
    } else {
      setPassengerCountErr(false);
    }
  }

  // Fucntion to format the date
  const toISOStringWithTimezone = (date) => {
    const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
    return `${date.getFullYear()
    }-${pad(date.getMonth() + 1)
    }-${pad(date.getDate())
    }T${pad(date.getHours())
    }:${pad(date.getMinutes())
    }`;
  };

  // Function to handle submit form
  function handleSubmit() {
    let check = true;
    // Need to clean logic
    if (inputValues.pickup.length <= 1) {
      setPickupErr(true);
      check = false;
    }
    if (inputValues.dropoff.length <= 1) {
      setDdropoffErr(true);
      check = false;
    }
    if (passengerCountRef.current.value === '0') {
      setPassengerCountErr(true);
      check = false;
    }
    if (check) {
      console.log('submit', dateTimeValue, inputValues, passengerCountRef.current.value);
      window.location.href = `https://mysedanweb.limosys.com/AirlinkWeb/newTrip?tripDtm=${toISOStringWithTimezone(dateTimeValue)}&puAddr=${inputValues.pickup}&doAddr=${inputValues.dropoff}&passCount=${passengerCountRef.current.value}`;
    }
  }

  return (
    <Card className="justify-content-center" style={{ margin: '5% 5%' }}>
      <Card.Body>
        <Form>
          <Row>
            <Col lg={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>Pickup Address</Form.Label>
                <InputGroup className="inputGroupBorder">
                  <Form.Control
                    onFocus={() => { inputChange('pickup'); }}
                    list="pickupSuggestions"
                    isInvalid={pickupErr}
                    style={{ borderRight: !pickupErr ? 'none' : null }}
                    value={inputValues.pickup}
                    onChange={(e) => { inputChange(e, 'pickup'); }}
                    type="none"
                    placeholder="Enter pickup address"
                    className="shadow-none"
                  />
                  <InputGroup.Text style={{
                    backgroundColor: 'white', paddingLeft: '30px', borderLeft: 'none',
                  }}
                  >
                    <CloseButton
                      className="shadow-none"
                      onClick={() => { handleClear('pickup'); }}
                      style={{
                        position: 'absolute', top: '12px', right: '12px', height: '8px', width: '8px',
                      }}
                    />
                  </InputGroup.Text>
                </InputGroup>
                {showSuggestions && currentInput === 'pickup' ? (
                  <datalist id="pickupSuggestions">
                    {suggestions.map((suggestion) => (
                      <option
                        key={suggestion}
                        onClick={(e) => handleOptionSelect(e)}
                        value={suggestion}
                      >
                        {suggestion}
                      </option>
                    ))}
                  </datalist>
                ) : null}
              </Form.Group>
            </Col>
            <Col lg={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>Dropoff Address</Form.Label>
                <InputGroup className="inputGroupBorder">
                  <Form.Control
                    onFocus={() => { inputChange('dropoff'); }}
                    list="dropoffSuggestions"
                    isInvalid={dropoffErr}
                    style={{ borderRight: !dropoffErr ? 'none' : null }}
                    value={inputValues.dropoff}
                    onChange={(e) => { inputChange(e, 'dropoff'); }}
                    type="none"
                    placeholder="Enter dropoff address"
                    className="shadow-none"
                  />
                  <InputGroup.Text style={{
                    backgroundColor: 'white', paddingLeft: '30px', borderLeft: 'none',
                  }}
                  >
                    <CloseButton
                      className="shadow-none"
                      onClick={() => { handleClear('dropoff'); }}
                      style={{
                        position: 'absolute', top: '12px', right: '12px', height: '8px', width: '8px',
                      }}
                    />
                  </InputGroup.Text>
                </InputGroup>
                {showSuggestions && currentInput === 'dropoff' ? (
                  <datalist id="dropoffSuggestions" style={{ border: 'none' }}>
                    {suggestions.map((suggestion) => (
                      <option
                        key={suggestion}
                        onClick={(e) => handleOptionSelect(e)}
                        value={suggestion}
                      >
                        {suggestion}
                      </option>
                    ))}
                  </datalist>
                ) : null}
              </Form.Group>
            </Col>
            <Col lg={6} sm={12}>
              <Form.Group className="shadow-none">
                <Form.Label>Date and Time</Form.Label>
                <DateTimePicker
                  className="shadow-none"
                  clearIcon={(
                    <div
                      className="btn-close shadow-none"
                      style={{
                        position: 'absolute', top: '12px', right: '12px', height: '16px',
                      }}
                    />
                  )}
                  onChange={((value) => {
                    if (!value) {
                      setTimeout(() => {
                        setDateTimeChange(new Date());
                      });
                    } else {
                      setDateTimeChange(value);
                    }
                  })}
                  value={dateTimeValue}
                  calendarIcon={null}
                  monthPlaceholder="M"
                  minutePlaceholder="M"
                  hourPlaceholder="H"
                  dayPlaceholder="D"
                  yearPlaceholder="YYYY"
                  minDate={new Date()}
                  returnValue="start"
                  disableClock
                />
              </Form.Group>
            </Col>
            <Col lg={4} sm={12}>
              <Form.Group className="shadow-none">
                <Form.Label>Passengers</Form.Label>
                <InputGroup className="shadow-none">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faUserPlus} style={{ color: '#6c757d' }} />
                  </InputGroup.Text>
                  <Form.Select isInvalid={passengerCountErr} onClick={() => { inputChange(); }} className="shadow-none" ref={passengerCountRef}>
                    <option value={0} key={0}>Select number of passengers</option>
                    {passengerCount}
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col lg={2} xs={12} className="align-self-start">
              <Button variant="secondary" type="button" onClick={() => { handleSubmit(); }} style={{ width: '100%', fontWeight: 600, marginTop: '32px' }}>
                SUBMIT
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default App;
