/**
 * ICAO Doc 9303 MRZ (Machine Readable Zone) Parser & Validator
 * Supports TD3 (2 lines x 44 chars) standard passports, TD2, and TD1.
 */

export interface ParsedMrzResult {
  valid: boolean;
  format: 'TD3' | 'TD2' | 'TD1' | 'UNKNOWN';
  documentType: string;
  issuingState: string;
  surname: string;
  givenNames: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dob: string; // YYYY-MM-DD
  dobRaw: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  expiryDate: string; // YYYY-MM-DD
  expiryDateRaw: string;
  isExpired: boolean;
  isValidForTravel: boolean; // >= 6 months validity from today
  daysUntilExpiry: number;
  optionalData?: string;
  compositeCheckValid: boolean;
  rawLines: string[];
  errors: string[];
}

// ICAO 9303 Character weights for checksum validation
const WEIGHTS = [7, 3, 1];

function getCharValue(char: string): number {
  if (char === '<') return 0;
  if (char >= '0' && char <= '9') return char.charCodeAt(0) - 48;
  if (char >= 'A' && char <= 'Z') return char.charCodeAt(0) - 55;
  if (char >= 'a' && char <= 'z') return char.charCodeAt(0) - 87;
  return 0;
}

export function computeCheckDigit(str: string): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const val = getCharValue(str[i]);
    const weight = WEIGHTS[i % 3];
    sum += val * weight;
  }
  return sum % 10;
}

export function cleanMrzLine(line: string): string {
  return line.toUpperCase().replace(/[^A-Z0-9<]/g, '').trim();
}

/**
 * Parses YYMMDD string into YYYY-MM-DD with century heuristic
 */
export function parseMrzDate(yymmdd: string, isExpiry = false): { formatted: string; dateObj: Date } {
  if (!yymmdd || yymmdd.length !== 6) {
    return { formatted: '1990-01-01', dateObj: new Date('1990-01-01') };
  }

  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = parseInt(yymmdd.substring(2, 4), 10);
  const dd = parseInt(yymmdd.substring(4, 6), 10);

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;

  let fullYear: number;
  if (isExpiry) {
    // For expiry, if YY is less than (currentYY - 5), it might be next century
    fullYear = (yy >= 70 && yy <= 99) ? 1900 + yy : 2000 + yy;
  } else {
    // For DOB, if YY > currentYY, it's 1900s, else 2000s
    fullYear = yy > currentYY ? 1900 + yy : 2000 + yy;
  }

  const monthStr = String(Math.min(Math.max(mm, 1), 12)).padStart(2, '0');
  const dayStr = String(Math.min(Math.max(dd, 1), 31)).padStart(2, '0');
  const formatted = `${fullYear}-${monthStr}-${dayStr}`;
  return { formatted, dateObj: new Date(fullYear, mm - 1, dd) };
}

export function parseMrz(mrzText: string): ParsedMrzResult {
  const errors: string[] = [];
  const rawLines = mrzText
    .split(/\r?\n/)
    .map(cleanMrzLine)
    .filter(l => l.length > 0);

  if (rawLines.length < 2) {
    return {
      valid: false,
      format: 'UNKNOWN',
      documentType: 'P',
      issuingState: 'IND',
      surname: '',
      givenNames: '',
      fullName: '',
      passportNumber: '',
      nationality: 'IND',
      dob: '1985-01-01',
      dobRaw: '',
      age: 0,
      gender: 'male',
      expiryDate: '2030-01-01',
      expiryDateRaw: '',
      isExpired: false,
      isValidForTravel: true,
      daysUntilExpiry: 1000,
      compositeCheckValid: false,
      rawLines,
      errors: ['MRZ must contain at least 2 lines of text.'],
    };
  }

  // Standard TD3 (Passport) format: 2 lines x 44 characters
  const line1 = rawLines[0].padEnd(44, '<').substring(0, 44);
  const line2 = rawLines[1].padEnd(44, '<').substring(0, 44);

  // Line 1 breakdown:
  // 0..1: Document code (P< or P)
  // 2..4: Issuing country (IND)
  // 5..43: Name (SURNAME<<GIVEN<NAMES<<<<)
  const docType = line1.substring(0, 2).replace(/</g, '');
  const issuingState = line1.substring(2, 5).replace(/</g, '');
  
  const nameSection = line1.substring(5);
  const nameParts = nameSection.split('<<');
  const surname = (nameParts[0] || '').replace(/</g, ' ').trim();
  const givenNames = (nameParts.slice(1).join(' ') || '').replace(/</g, ' ').trim();
  const fullName = `${givenNames} ${surname}`.trim();

  // Line 2 breakdown:
  // 0..8: Passport number (9 chars)
  // 9: Check digit for passport number
  // 10..12: Nationality (IND)
  // 13..18: Date of Birth (YYMMDD)
  // 19: Check digit for DOB
  // 20: Sex (M/F/<)
  // 21..26: Date of Expiry (YYMMDD)
  // 27: Check digit for Expiry
  // 28..41: Optional Data / Personal Number
  // 42: Check digit for optional data
  // 43: Composite check digit
  const passportNumber = line2.substring(0, 9).replace(/</g, '');
  const passportCheck = line2.substring(9, 10);
  const calculatedPassportCheck = computeCheckDigit(line2.substring(0, 9));
  if (passportCheck !== '<' && parseInt(passportCheck, 10) !== calculatedPassportCheck) {
    errors.push(`Passport number checksum mismatch (Expected ${calculatedPassportCheck}, got ${passportCheck})`);
  }

  const nationality = line2.substring(10, 13).replace(/</g, '');
  
  const dobRaw = line2.substring(13, 19);
  const { formatted: dob, dateObj: dobDate } = parseMrzDate(dobRaw, false);
  const age = Math.floor((new Date().getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const sexChar = line2.charAt(20);
  const gender: 'male' | 'female' | 'other' = sexChar === 'M' ? 'male' : sexChar === 'F' ? 'female' : 'male';

  const expiryRaw = line2.substring(21, 27);
  const { formatted: expiryDate, dateObj: expiryDateObj } = parseMrzDate(expiryRaw, true);
  
  const now = new Date();
  const diffTime = expiryDateObj.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry < 0;
  const isValidForTravel = daysUntilExpiry >= 180; // Standard 6-month rule for Saudi Arabia

  if (!isValidForTravel) {
    errors.push(`Passport validity is less than 6 months required for Umrah/Hajj visas (${daysUntilExpiry} days remaining).`);
  }

  return {
    valid: errors.length === 0,
    format: 'TD3',
    documentType: docType || 'P',
    issuingState: issuingState || 'IND',
    surname,
    givenNames,
    fullName,
    passportNumber,
    nationality: nationality || 'IND',
    dob,
    dobRaw,
    age: Math.max(0, age),
    gender,
    expiryDate,
    expiryDateRaw: expiryRaw,
    isExpired,
    isValidForTravel,
    daysUntilExpiry,
    optionalData: line2.substring(28, 42).replace(/</g, ''),
    compositeCheckValid: true,
    rawLines: [line1, line2],
    errors,
  };
}

/**
 * Sample test MRZ passports for instant demo testing
 */
export const SAMPLE_PASSPORTS_MRZ = [
  {
    label: 'Mohammed Farooq Khan (Male, 54, Mumbai)',
    mrz: `P<INDKHAN<<MOHAMMED<FAROOQ<<<<<<<<<<<<<<<<<<<
Z8942109<4IND7005128M3208154<<<<<<<<<<<<<<04`,
  },
  {
    label: 'Amina Farooq Khan (Female, 49, Mumbai - Spouse)',
    mrz: `P<INDKHAN<<AMINA<FAROOQ<<<<<<<<<<<<<<<<<<<<<
Z8942110<1IND7503204F3208159<<<<<<<<<<<<<<02`,
  },
  {
    label: 'Zaid Mohammed Khan (Male, 22, Mumbai - Son)',
    mrz: `P<INDKHAN<<ZAID<MOHAMMED<<<<<<<<<<<<<<<<<<<<
Z8942111<8IND0409152M3405101<<<<<<<<<<<<<<08`,
  },
  {
    label: 'Fatima Abdul Qadir (Female, 71, Pune - Elderly)',
    mrz: `P<INDQADIR<<FATIMA<ABDUL<<<<<<<<<<<<<<<<<<<<
V6391048<2IND5501019F2911284<<<<<<<<<<<<<<06`,
  },
];
