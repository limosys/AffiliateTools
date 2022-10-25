// Function to handle the date formatting
export default function toISOStringWithTimezone(date) {
  const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  return `${date.getFullYear()
  }-${pad(date.getMonth() + 1)
  }-${pad(date.getDate())
  }T${pad(date.getHours())
  }:${pad(date.getMinutes())
  }`;
}
