import dateToISOString from './dateHandler';

// Function to handle submit form
export default function handleSubmit(
  inputValues,
  passengerOptionsRef,
  inputErr,
  setInputErr,
  dateTimeValue,
  passCount,
) {
  let check = true;
  const inputErrObj = inputErr;
  if (inputValues.pickup.length <= 9) {
    inputErrObj.pickup = true;
    check = false;
  }
  if (inputValues.dropoff.length <= 9) {
    inputErrObj.dropoff = true;
    check = false;
  }
  if (passCount < 1 || passCount > 55) {
    inputErrObj.passenger = true;
    check = false;
  }
  setInputErr({ ...inputErr, inputErrObj });
  if (check) {
    if (new URL(window.location)?.host.includes('airlink')) {
      window.open(`https://goairlink.limosys.com/AirlinkWeb/newTrip?tripDtm=${dateToISOString(dateTimeValue)}&puAddr=${inputValues.pickup}&doAddr=${inputValues.dropoff}&passCount=${passengerOptionsRef.current.value}`, '_top');
    } else {
      window.open('https://limosys.com', '_top');
    }
  }
}
