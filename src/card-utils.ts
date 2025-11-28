// Valida número do cartão usando Luhn Algorithm
export function validateCardNumber(number: string): boolean {
  const clean = number.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// Detecta bandeira pelo prefixo
export function getCardBrand(number: string): string {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6/.test(clean)) return 'Discover';
  return 'Desconhecida';
}

// Valida mês e ano
export function validateExp(month: string, year: string): boolean {
  const m = parseInt(month);
  const y = parseInt(year);
  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) return false;
  const now = new Date();
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1);
}

// Valida CVV
export function validateCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}
