export namespace Validation {
  export function isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  export function isOnlyDigits(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  export function isValidYear(year: string): boolean {
    if (!/^\d{4}$/.test(year.trim())) return false;
    const y = parseInt(year, 10);
    return y >= 1000 && y <= new Date().getFullYear();
  }

  export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}