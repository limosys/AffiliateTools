import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import {
  Form, Button, Card, Row, Col, CloseButton, InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus, faLocationDot, faPlus, faMinus,
} from '@fortawesome/free-solid-svg-icons';
import DateTimePicker from 'react-datetime-picker';
import { DatalistInput } from 'react-datalist-input';
// import generatePassengerOptions from './utils/generate_passenger_options';
import handleSubmit from './utils/handle_submit';
import { SocketContext } from './context/socket_context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const dev = window.location.host.split(':')[1] === '3000';
// Main page function
function App() {
  const socket = useContext(SocketContext);
  const [currentInput, setCurrentInput] = useState('');
  const [inputValues, setInputValues] = useState({ pickup: '', dropoff: '' });
  // const [passengerOptions, setPassengerOptions] = useState([]);
  const [passCount, setPassCount] = useState(1);
  const [suggestions, setSuggestions] = useState({ pickup: [], dropoff: [] });
  const [dateTimeValue, setDateTimeChange] = useState(new Date());
  const passengerOptionsRef = useRef();
  const [inputErr, setInputErr] = useState({ pickup: false, dropoff: false, passenger: false });

  // On page load => Connect websocket
  useEffect(() => {
    // setPassengerOptions(generatePassengerOptions(55));
    socket.on('connect', () => {
      if (dev) { console.log('Websocket Connected'); }
    });
    socket.on('disconnect', () => {
      if (dev) { console.log('Websocket Disconnected'); }
    });
    // On websocket response.
    socket.on('suggestions', (res) => {
      if (dev) { console.log('websocket response', res); }
      const suggestionArray = [];
      for (let i = 0; i < res.predictions.length; i += 1) {
        suggestionArray.push(
          {
            id: res.predictions[i].place_id,
            node: (
              <>
                <FontAwesomeIcon icon={faLocationDot} style={{ color: '#6c757d', padding: '0 5px 0 1px', fontSize: '95%' }} />
                <i style={{ fontWeight: '600' }}>
                  {res.predictions[i].structured_formatting.main_text}
                </i>
                <span>
                  {', '}
                  {res.predictions[i].structured_formatting.secondary_text}
                </span>
              </>
            ),
            value: `${res.predictions[i].structured_formatting.main_text}, ${res.predictions[i].structured_formatting.secondary_text}`,
          },
        );
      }
      setSuggestions({ ...suggestions, [currentInput]: suggestionArray });
    });
    socket.on('error', (err) => {
      if (dev) { console.log('websocket error', err); }
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('suggestions');
      socket.off('error');
    };
  }, [currentInput]);

  // function to handle option select
  async function handleOptionSelect(selectedInput) {
    setTimeout(() => {
      setSuggestions({ ...suggestions, [selectedInput]: [] });
    }, 100);
  }

  function handlePassCountChange(e) {
    console.log(e.currentTarget.value, e.currentTarget?.attributes?.max?.value);
    if (e.currentTarget.className.includes('up') && passCount < e.currentTarget.parentNode.parentNode.children[1].max) {
      setPassCount(passCount + 1);
    } else if (e.currentTarget.className.includes('down') && passCount > e.currentTarget.parentNode.parentNode.children[1].min) {
      setPassCount(passCount - 1);
    } else if (
      (parseFloat(e.currentTarget?.value) <= parseFloat(e.currentTarget?.attributes?.max?.value)
      && parseFloat(e.currentTarget?.value) >= parseFloat(e.currentTarget?.attributes?.min?.value))
    ) {
      setPassCount(parseFloat(e.currentTarget.value));
    } else if (e.currentTarget.value === '' && !e.currentTarget.className.includes('down') && !e.currentTarget.className.includes('up')) {
      setPassCount(1);
    } else {
      setInputErr({ ...inputErr, passenger: true });
      setTimeout(() => {
        setInputErr({ ...inputErr, passenger: false });
      }, 400);
    }
  }

  // Function to handle clear input
  function handleClear(inputToClear) {
    setSuggestions({ ...suggestions, [inputToClear]: [] });
    setInputValues({ ...inputValues, [inputToClear]: '' });
  }

  // Function to handle the input change
  function inputChange(e, type) {
    if (type) {
      setCurrentInput(`${type}`);
      if (e.length > 1 && !suggestions[`${type}`].some((entry) => entry.value === e)) {
        socket.emit('query', e);
      }
      setInputValues({
        ...inputValues,
        [type]: e,
      });
    } else {
      Object.keys(inputErr).forEach((key) => {
        inputErr[key] = false;
      });
      setInputErr({ ...inputErr, inputErr });
    }
  }

  // Form page
  return (
    <Card
      className="justify-content-center"
      style={{
        margin: '2% 2%',
        backgroundColor: 'transparent',
        border: 'none',
      }}
    >
      <Card.Body>
        <Form>
          <Row>
            <Col lg={6} sm={12}>
              <DatalistInput
                inputProps={{
                  style: {
                    border: (inputErr.pickup ? '1px solid red' : '1px solid #ced4da'),
                  },
                  onMouseDown: (inputErr.pickup ? inputChange : null),
                }}
                placeholder="Pickup Address"
                value={inputValues.pickup}
                setValue={(e) => inputChange(e, 'pickup')}
                label={(
                  <>
                    <Form.Label style={{
                      color: '#FFFFFF',
                      fontFamily: 'Sans-serif',
                      fontWeight: 500,
                      marginBottom: '-3px',
                      marginTop: '7px',
                    }}
                    >
                      Pickup Address
                    </Form.Label>
                    <CloseButton
                      className="shadow-none"
                      onClick={() => { handleClear('pickup'); }}
                      style={{
                        position: 'absolute',
                        top: '42px',
                        right: '12px',
                        height: '8px',
                        width: '8px',
                      }}
                    />
                  </>
            )}
                onSelect={() => handleOptionSelect('pickup')}
                items={suggestions.pickup}
              />
            </Col>
            <Col lg={6} sm={12}>
              <DatalistInput
                inputProps={{
                  style: {
                    border: (inputErr.dropoff ? '1px solid red' : '1px solid #ced4da'),
                  },
                  onMouseDown: (inputErr.dropoff ? inputChange : null),
                }}
                placeholder="Dropoff Address"
                value={inputValues.dropoff}
                setValue={(e) => inputChange(e, 'dropoff')}
                label={(
                  <>
                    <Form.Label style={{
                      color: '#FFFFFF',
                      fontFamily: 'Sans-serif',
                      fontWeight: 500,
                      marginBottom: '-3px',
                      marginTop: '7px',
                    }}
                    >
                      Dropoff Address
                    </Form.Label>
                    <CloseButton
                      className="shadow-none"
                      onClick={() => { handleClear('dropoff'); }}
                      style={{
                        position: 'absolute',
                        top: '42px',
                        right: '12px',
                        height: '8px',
                        width: '8px',
                      }}
                    />
                  </>
                )}
                onSelect={() => handleOptionSelect('dropoff')}
                items={suggestions.dropoff}
              />
            </Col>
            <Col lg={6} sm={12}>
              <Form.Group className="shadow-none">
                <Form.Label style={{
                  color: '#FFFFFF',
                  fontFamily: 'Sans-serif',
                  fontWeight: 500,
                  marginBottom: '-3px',
                  marginTop: '7px',
                }}
                >
                  Date and Time
                </Form.Label>
                <DateTimePicker
                  className="shadow-none"
                  clearIcon={(
                    <div
                      className="btn-close shadow-none"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        height: '16px',
                      }}
                    />
                  )}
                  onChange={((dateValue) => {
                    if (!dateValue) {
                      setTimeout(() => {
                        setDateTimeChange(new Date());
                      });
                    } else {
                      setDateTimeChange(dateValue);
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
            <Col lg={4} xs={8}>
              <Form.Group>
                <Form.Label style={{
                  color: '#FFFFFF',
                  fontFamily: 'Sans-serif',
                  fontWeight: 500,
                  marginBottom: '-3px',
                  marginTop: '7px',
                }}
                >
                  Passengers
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faUserPlus} style={{ color: '#6c757d' }} />
                  </InputGroup.Text>
                  {/* <Form.Select
                    onMouseDown={() => { if (inputErr.passenger) inputChange(); }}
                    ref={passengerOptionsRef}
                    style={{
                      border: (inputErr.passenger ? '1px solid red' : '1px solid #ced4da'),
                    }}
                    className="shadow-none"
                  >
                    <option value={0} key={0}>Select number of passengers</option>
                    {passengerOptions}
                  </Form.Select> */}
                  <Form.Control
                    type="number"
                    id="passCount"
                    style={{
                      border: (inputErr.passenger ? '1px solid red' : '1px solid #ced4da'),
                    }}
                    onChange={(e) => {
                      handlePassCountChange(e);
                    }}
                    value={passCount}
                    min={1}
                    max={55}
                    className="shadow-none"
                  />
                  <InputGroup.Text style={{ backgroundColor: 'white' }}>
                    <button type="button" className="quantity-button quantity-down" onClick={(e) => { handlePassCountChange(e); }} style={{ marginLeft: '-5px' }}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <button type="button" className="quantity-button quantity-up" onClick={(e) => { handlePassCountChange(e); }} style={{ marginLeft: '7px', marginRight: '-5px' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col lg={2} xs={4} className="align-self-start">
              <Button
                type="button"
                onClick={() => {
                  handleSubmit(
                    inputValues,
                    passengerOptionsRef,
                    inputErr,
                    setInputErr,
                    dateTimeValue,
                    passCount,
                  );
                }}
                style={{
                  width: '100%',
                  fontWeight: 500,
                  marginTop: '32px',
                  backgroundColor: '#6fbb52',
                  outline: 'none',
                  border: 'none',
                  fontFamily: 'Sans-serif',
                }}
              >
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
