export const normalizePhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, ''); 
  if (digits.startsWith('234') && digits.length === 13) {
    return '0' + digits.slice(3); 
  }
  return digits;
};