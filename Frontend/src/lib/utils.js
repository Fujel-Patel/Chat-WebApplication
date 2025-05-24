// src/lib/utils.js

export const formatMessageTime = (timestamp) => {
  // Defensive check: If timestamp is not provided, return a fallback string
  if (!timestamp) {
    return "N/A Time"; // Or an empty string ''
  }

  const date = new Date(timestamp);

  // Defensive check: If the date object is invalid (e.g., from a malformed timestamp)
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Or a specific error message
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// You might also have other utility functions here

// export function formatMessageTime(date) {
//     return new Date(date).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
//   }