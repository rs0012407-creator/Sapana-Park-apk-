/**
 * Form validation helpers for Indian phone numbers, flat formats, and Goa vehicle plates.
 */

export function isValidIndianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  // Standard 10 digit starting with 6-9, or 12 digit with 91 prefix
  return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?)?[6789]\d{9}$/.test(cleanPhone);
}

export function isValidFlatNumber(flat: string): boolean {
  // Format: Wing-Flat, e.g. A-101, B-402, C-303, D-204
  return /^[A-D]\-[1-4][0-9]{2}$/i.test(flat.trim());
}

export function isValidGoaVehicleNumber(plate: string): boolean {
  // Format GA-01 through GA-12 followed by series and number e.g. GA-07-C-1234
  return /^GA\-[0-1][0-9]\-[A-Z]{1,2}\-[0-9]{4}$/i.test(plate.trim());
}

export function formatFlatNumber(flat: string): string {
  return flat.trim().toUpperCase();
}
