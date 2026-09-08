import type { Venue } from '../types/index.ts';

export const MAX_TRANSLATE_TEXT_LENGTH = 5000;
export const MAX_TRANSLATE_CONTEXT_LENGTH = 1000;

export const MIN_MAP_RADIUS_KM = 0.05;
export const MAX_MAP_RADIUS_KM = 20.0;
export const MAX_MAP_VENUES_COUNT = 200;
export const MAX_MAP_STRING_LENGTH = 300;

export const MIN_DONATE_AMOUNT = 500;
export const MAX_DONATE_AMOUNT = 10_000_000;
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

export interface ValidatedTranslateInput {
  text: string;
  context?: string;
}

export function validateTranslateInput(body: unknown): ValidationResult<ValidatedTranslateInput> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { text, context } = body as Record<string, unknown>;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return { valid: false, error: 'Validation error: text is required and must be a non-empty string' };
  }

  if (text.length > MAX_TRANSLATE_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Validation error: text exceeds maximum length of ${MAX_TRANSLATE_TEXT_LENGTH} characters`,
    };
  }

  let validatedContext: string | undefined = undefined;
  if (context !== undefined && context !== null) {
    if (typeof context !== 'string') {
      return { valid: false, error: 'Validation error: context must be a string' };
    }
    if (context.length > MAX_TRANSLATE_CONTEXT_LENGTH) {
      return {
        valid: false,
        error: `Validation error: context exceeds maximum length of ${MAX_TRANSLATE_CONTEXT_LENGTH} characters`,
      };
    }
    validatedContext = context;
  }

  return {
    valid: true,
    data: {
      text,
      context: validatedContext,
    },
  };
}

export function isValidCoordinateNumber(val: unknown, min: number, max: number): val is number {
  return typeof val === 'number' && !isNaN(val) && isFinite(val) && val >= min && val <= max;
}

export function validateMapVenues(rawVenues: unknown): ValidationResult<Venue[]> {
  if (!rawVenues) return { valid: true, data: [] };
  if (!Array.isArray(rawVenues)) {
    return { valid: false, error: 'Venues must be an array' };
  }
  if (rawVenues.length > MAX_MAP_VENUES_COUNT) {
    return {
      valid: false,
      error: `Venues count exceeds maximum allowed limit of ${MAX_MAP_VENUES_COUNT}`,
    };
  }

  const validatedVenues: Venue[] = [];

  for (let i = 0; i < rawVenues.length; i++) {
    const v = rawVenues[i];
    if (!v || typeof v !== 'object') {
      return { valid: false, error: `Venue at index ${i} is invalid` };
    }

    const { id, name, nameEn, area, address, access, description, location } = v as Record<string, unknown>;

    if (typeof id !== 'string' || typeof name !== 'string') {
      return { valid: false, error: `Venue at index ${i} missing required id or name string` };
    }

    const loc = location as { lat?: unknown; lng?: unknown } | undefined;
    if (
      !loc ||
      typeof loc !== 'object' ||
      !isValidCoordinateNumber(loc.lat, -90, 90) ||
      !isValidCoordinateNumber(loc.lng, -180, 180)
    ) {
      return { valid: false, error: `Venue "${name}" has invalid or missing coordinates` };
    }

    const sanitizeStr = (s: unknown) =>
      typeof s === 'string' ? s.slice(0, MAX_MAP_STRING_LENGTH) : undefined;

    validatedVenues.push({
      id: id.slice(0, 100),
      name: name.slice(0, MAX_MAP_STRING_LENGTH),
      nameEn: sanitizeStr(nameEn),
      area: typeof area === 'string' ? area.slice(0, 100) : '',
      address: typeof address === 'string' ? address.slice(0, MAX_MAP_STRING_LENGTH) : '',
      access: typeof access === 'string' ? access.slice(0, MAX_MAP_STRING_LENGTH) : '',
      description: sanitizeStr(description),
      location: {
        lat: loc.lat,
        lng: loc.lng,
      },
    });
  }

  return { valid: true, data: validatedVenues };
}

export interface ValidatedDonateInput {
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorMessage: string;
  isEn: boolean;
}

export function validateDonateInput(body: unknown): ValidationResult<ValidatedDonateInput> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { amount, donorName, donorEmail, donorMessage, locale } = body as Record<string, unknown>;

  const numAmount = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isInteger(numAmount) || numAmount < MIN_DONATE_AMOUNT || numAmount > MAX_DONATE_AMOUNT) {
    return {
      valid: false,
      error: `Invalid donation amount. Amount must be an integer between ¥${MIN_DONATE_AMOUNT.toLocaleString()} and ¥${MAX_DONATE_AMOUNT.toLocaleString()}.`,
    };
  }

  let sanitizedEmail: string | undefined = undefined;
  if (donorEmail !== undefined && donorEmail !== null && donorEmail !== '') {
    if (typeof donorEmail !== 'string') {
      return { valid: false, error: 'Invalid email address format' };
    }
    const trimmedEmail = donorEmail.trim();
    if (trimmedEmail.length > 254 || !EMAIL_REGEX.test(trimmedEmail)) {
      return { valid: false, error: 'Please provide a valid email address' };
    }
    sanitizedEmail = trimmedEmail;
  }

  const sanitizedName = typeof donorName === 'string' ? donorName.slice(0, 200).trim() : '';
  const sanitizedMessage = typeof donorMessage === 'string' ? donorMessage.slice(0, 500).trim() : '';
  const isEn = locale === 'en';

  return {
    valid: true,
    data: {
      amount: numAmount,
      donorName: sanitizedName,
      donorEmail: sanitizedEmail,
      donorMessage: sanitizedMessage,
      isEn,
    },
  };
}

export function getVerifiedOrigin(envUrl?: string): string {
  const url = envUrl || process.env.NEXT_PUBLIC_SITE_URL;
  if (url && typeof url === 'string') {
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // ignore parse error, fallback below
    }
  }

  return 'http://localhost:3000';
}
