// Generate a random 16-digit card number as a string
export function generateCardNumber(): string {
  let number = '';
  for (let i = 0; i < 16; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

// Generate a random 3-digit CVV as a string
export function generateCVV(): string {
  let cvv = '';
  for (let i = 0; i < 3; i++) {
    cvv += Math.floor(Math.random() * 10).toString();
  }
  return cvv;
}

// Generate expiry date MM/YY, at least 3 years into the future
export function generateExpiryDate(): string {
  const now = new Date();
  const futureYear = now.getFullYear() + 3;
  const month = now.getMonth() + 1; // 0-based months

  // Format month as MM
  const mm = month < 10 ? `0${month}` : `${month}`;
  // Get last two digits of year
  const yy = futureYear.toString().slice(-2);

  return `${mm}/${yy}`;
}