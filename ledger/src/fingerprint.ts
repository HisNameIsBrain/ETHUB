import { createHmac, timingSafeEqual } from 'crypto';

export function hmacFingerprint(rawFingerprint: string, key: string, salt: string) {
  const mac = createHmac('sha256', Buffer.from(key,'utf8'));
  mac.update(salt, 'utf8');
  mac.update(rawFingerprint, 'utf8');
  return mac.digest('hex');
}

export function matchHmac(provided: string, expectedHex: string, key: string, salt: string) {
  const calc = Buffer.from(hmacFingerprint(provided, key, salt),'hex');
  const exp = Buffer.from(expectedHex,'hex');
  if (calc.length !== exp.length) return false;
  return timingSafeEqual(calc, exp);
}
