export const normalizePhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, ''); // Remove all non-digit chars
  if (digits.startsWith('234') && digits.length === 13) {
    return '0' + digits.slice(3); // Convert +234803... to 0803...
  }
  return digits;
};