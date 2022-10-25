import React from 'react';

// Function to generate select options for passenger count
export default function generatePassengerOptions(num) {
  const passengerCount = [];
  for (let i = 1; i <= num; i += 1) {
    passengerCount.push(<option value={i} key={i}>{i}</option>);
  }
  return passengerCount;
}
