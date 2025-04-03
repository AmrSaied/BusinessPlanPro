import { randomBytes } from 'crypto';

/**
 * Generate a random PNR (Passenger Name Record) code
 * Format: 6 alphanumeric characters
 */
export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit similar looking characters
  let pnr = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    pnr += chars.charAt(randomIndex);
  }
  
  return pnr;
}

/**
 * Generate a random string of the specified length
 */
export function generateRandomString(length: number): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
