// FOR EXAMPLE:
// input value: +7 910 209-79-14
// output value: +79102097914
export const formatPhoneNumber = (number: string): string => {
  let cleaned = number.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+7')) {
    cleaned = '+7' + cleaned.slice(2);
  }

  return cleaned;
};
