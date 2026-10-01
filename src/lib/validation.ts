/**
 * Validation utilities for CV input fields (email, phone, URLs).
 */

/**
 * Validates an email address.
 * Empty or whitespace strings are treated as valid (optional field).
 */
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return true;
  const trimmed = email.trim();
  // Standard RFC 5322 approximation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates a phone number.
 * Supports domestic and international phone numbers (E.164: 7 to 15 digits).
 * Allows standard formatting characters: +, -, spaces, parentheses, dots.
 * Empty or whitespace strings are treated as valid (optional field).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return true;
  const trimmed = phone.trim();

  // Must only contain permitted phone characters
  if (!/^\+?[0-9\s\-().]{7,25}$/.test(trimmed)) return false;

  // Count total digits (E.164 standard allows 7 to 15 digits)
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates a URL (e.g. LinkedIn, GitHub, portfolio website, achievement links).
 * Accepts fully qualified URLs (https://...) and bare domains (e.g. linkedin.com/in/user).
 * Empty or whitespace strings are treated as valid (optional field).
 */
export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();

  // Reject URLs containing whitespace
  if (/\s/.test(trimmed)) return false;

  // Add https:// prefix if protocol is absent for URL parsing
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    // Only accept http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname;
    // Allow localhost for development
    if (hostname === 'localhost') return true;

    // Must have a domain dot and a valid TLD of at least 2 alpha characters
    if (!hostname.includes('.') || hostname.endsWith('.')) return false;

    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
  } catch {
    return false;
  }
}
