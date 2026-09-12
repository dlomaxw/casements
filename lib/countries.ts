/**
 * Dialling codes and national-number lengths for the phone field.
 *
 * `min`/`max` are the length of the *national significant number* — the part
 * after the country code and after any leading trunk "0" is stripped. A Ugandan
 * number written 0752 700 700 is 9 significant digits (752700700), so a visitor
 * can type it either way and still pass.
 *
 * Ranges are used where a country genuinely varies; a wrong fixed length would
 * reject real customers, which is far worse than accepting a slightly odd one.
 */
export interface Country {
  iso: string;
  name: string;
  dial: string; // without the "+"
  flag: string;
  min: number;
  max: number;
}

// East Africa first — that is where almost every enquiry comes from.
export const COUNTRIES: Country[] = [
  { iso: 'UG', name: 'Uganda', dial: '256', flag: '🇺🇬', min: 9, max: 9 },
  { iso: 'KE', name: 'Kenya', dial: '254', flag: '🇰🇪', min: 9, max: 9 },
  { iso: 'TZ', name: 'Tanzania', dial: '255', flag: '🇹🇿', min: 9, max: 9 },
  { iso: 'RW', name: 'Rwanda', dial: '250', flag: '🇷🇼', min: 9, max: 9 },
  { iso: 'BI', name: 'Burundi', dial: '257', flag: '🇧🇮', min: 8, max: 8 },
  { iso: 'SS', name: 'South Sudan', dial: '211', flag: '🇸🇸', min: 9, max: 9 },
  { iso: 'CD', name: 'DR Congo', dial: '243', flag: '🇨🇩', min: 9, max: 9 },
  { iso: 'ET', name: 'Ethiopia', dial: '251', flag: '🇪🇹', min: 9, max: 9 },
  { iso: 'SO', name: 'Somalia', dial: '252', flag: '🇸🇴', min: 7, max: 9 },
  { iso: 'SD', name: 'Sudan', dial: '249', flag: '🇸🇩', min: 9, max: 9 },

  // Rest of Africa
  { iso: 'AO', name: 'Angola', dial: '244', flag: '🇦🇴', min: 9, max: 9 },
  { iso: 'BW', name: 'Botswana', dial: '267', flag: '🇧🇼', min: 7, max: 8 },
  { iso: 'CM', name: 'Cameroon', dial: '237', flag: '🇨🇲', min: 9, max: 9 },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '225', flag: '🇨🇮', min: 10, max: 10 },
  { iso: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬', min: 9, max: 10 },
  { iso: 'GH', name: 'Ghana', dial: '233', flag: '🇬🇭', min: 9, max: 9 },
  { iso: 'MW', name: 'Malawi', dial: '265', flag: '🇲🇼', min: 7, max: 9 },
  { iso: 'MU', name: 'Mauritius', dial: '230', flag: '🇲🇺', min: 7, max: 8 },
  { iso: 'MA', name: 'Morocco', dial: '212', flag: '🇲🇦', min: 9, max: 9 },
  { iso: 'MZ', name: 'Mozambique', dial: '258', flag: '🇲🇿', min: 8, max: 9 },
  { iso: 'NA', name: 'Namibia', dial: '264', flag: '🇳🇦', min: 8, max: 9 },
  { iso: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬', min: 8, max: 10 },
  { iso: 'SN', name: 'Senegal', dial: '221', flag: '🇸🇳', min: 9, max: 9 },
  { iso: 'SC', name: 'Seychelles', dial: '248', flag: '🇸🇨', min: 7, max: 7 },
  { iso: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦', min: 9, max: 9 },
  { iso: 'TN', name: 'Tunisia', dial: '216', flag: '🇹🇳', min: 8, max: 8 },
  { iso: 'ZM', name: 'Zambia', dial: '260', flag: '🇿🇲', min: 9, max: 9 },
  { iso: 'ZW', name: 'Zimbabwe', dial: '263', flag: '🇿🇼', min: 9, max: 9 },

  // Middle East
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', flag: '🇦🇪', min: 8, max: 9 },
  { iso: 'BH', name: 'Bahrain', dial: '973', flag: '🇧🇭', min: 8, max: 8 },
  { iso: 'IL', name: 'Israel', dial: '972', flag: '🇮🇱', min: 8, max: 9 },
  { iso: 'KW', name: 'Kuwait', dial: '965', flag: '🇰🇼', min: 8, max: 8 },
  { iso: 'OM', name: 'Oman', dial: '968', flag: '🇴🇲', min: 8, max: 8 },
  { iso: 'QA', name: 'Qatar', dial: '974', flag: '🇶🇦', min: 8, max: 8 },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦', min: 9, max: 9 },
  { iso: 'TR', name: 'Türkiye', dial: '90', flag: '🇹🇷', min: 10, max: 10 },

  // Asia
  { iso: 'CN', name: 'China', dial: '86', flag: '🇨🇳', min: 11, max: 11 },
  { iso: 'IN', name: 'India', dial: '91', flag: '🇮🇳', min: 10, max: 10 },
  { iso: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩', min: 9, max: 12 },
  { iso: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵', min: 9, max: 10 },
  { iso: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾', min: 9, max: 10 },
  { iso: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰', min: 10, max: 10 },
  { iso: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭', min: 10, max: 10 },
  { iso: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬', min: 8, max: 8 },
  { iso: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷', min: 9, max: 10 },
  { iso: 'TH', name: 'Thailand', dial: '66', flag: '🇹🇭', min: 9, max: 9 },
  { iso: 'VN', name: 'Vietnam', dial: '84', flag: '🇻🇳', min: 9, max: 10 },

  // Europe
  { iso: 'AT', name: 'Austria', dial: '43', flag: '🇦🇹', min: 10, max: 11 },
  { iso: 'BE', name: 'Belgium', dial: '32', flag: '🇧🇪', min: 8, max: 9 },
  { iso: 'DK', name: 'Denmark', dial: '45', flag: '🇩🇰', min: 8, max: 8 },
  { iso: 'FI', name: 'Finland', dial: '358', flag: '🇫🇮', min: 9, max: 10 },
  { iso: 'FR', name: 'France', dial: '33', flag: '🇫🇷', min: 9, max: 9 },
  { iso: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪', min: 10, max: 11 },
  { iso: 'GR', name: 'Greece', dial: '30', flag: '🇬🇷', min: 10, max: 10 },
  { iso: 'IE', name: 'Ireland', dial: '353', flag: '🇮🇪', min: 9, max: 9 },
  { iso: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹', min: 9, max: 10 },
  { iso: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱', min: 9, max: 9 },
  { iso: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴', min: 8, max: 8 },
  { iso: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱', min: 9, max: 9 },
  { iso: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹', min: 9, max: 9 },
  { iso: 'RU', name: 'Russia', dial: '7', flag: '🇷🇺', min: 10, max: 10 },
  { iso: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸', min: 9, max: 9 },
  { iso: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪', min: 7, max: 9 },
  { iso: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭', min: 9, max: 9 },
  { iso: 'UA', name: 'Ukraine', dial: '380', flag: '🇺🇦', min: 9, max: 9 },
  { iso: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧', min: 10, max: 10 },

  // Americas & Oceania
  { iso: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷', min: 10, max: 10 },
  { iso: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺', min: 9, max: 9 },
  { iso: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷', min: 10, max: 11 },
  { iso: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦', min: 10, max: 10 },
  { iso: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽', min: 10, max: 10 },
  { iso: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿', min: 8, max: 10 },
  { iso: 'US', name: 'United States', dial: '1', flag: '🇺🇸', min: 10, max: 10 },
];

/** Casements is a Ugandan business — Uganda is always the starting selection. */
export const DEFAULT_COUNTRY = 'UG';

export function findCountry(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
}

/**
 * Keeps digits only and drops a leading trunk zero, which is how people in
 * Uganda, Kenya, the UK and most of Europe write their own numbers.
 */
export function nationalDigits(input: string): string {
  return input.replace(/\D/g, '').replace(/^0+/, '');
}

export interface PhoneCheck {
  valid: boolean;
  e164: string;
  error?: string;
}

const inRange = (n: number, c: Country) => n >= c.min && n <= c.max;

export function checkPhone(input: string, country: Country): PhoneCheck {
  let digits = nationalDigits(input);

  // People paste the full international form. If the number still carries its
  // own country code, drop it — but only when doing so actually produces a
  // plausible national number, so we never truncate a valid one.
  if (digits.startsWith(country.dial) && !inRange(digits.length, country)) {
    const stripped = digits.slice(country.dial.length).replace(/^0+/, '');
    if (inRange(stripped.length, country)) digits = stripped;
  }

  const e164 = `+${country.dial}${digits}`;
  if (!digits) return { valid: false, e164: '', error: 'Enter your phone number.' };

  const expected =
    country.min === country.max ? `${country.min} digits` : `${country.min}–${country.max} digits`;

  if (!inRange(digits.length, country)) {
    return {
      valid: false,
      e164,
      error: `${country.name} numbers need ${expected} after +${country.dial} — you entered ${digits.length}.`,
    };
  }
  return { valid: true, e164 };
}

/**
 * When someone pastes a number in full international form, work out which
 * country it belongs to so the selector can follow along. Longest dial code
 * wins, and the remainder must be a plausible length for that country.
 */
export function detectCountry(input: string): string | null {
  if (!input.trim().startsWith('+')) return null;
  const digits = input.replace(/\D/g, '');
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => digits.startsWith(c.dial) && inRange(digits.length - c.dial.length, c));
  return match?.iso ?? null;
}
