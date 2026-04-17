/**
 * Clover Customer API — mailing list / rewards signups.
 *
 * Set in .env (server / project root):
 *   CLOVER_MERCHANT_ID   — merchant UUID
 *   CLOVER_API_TOKEN     — merchant API token (sandbox test token or production OAuth token)
 *   CLOVER_REGION        — optional: sandbox | na | eu | la (default: sandbox)
 *   CLOVER_API_BASE_URL  — optional: override API host entirely
 *
 * Docs: https://docs.clover.com/dev/reference/customerscreatecustomer
 */

const USER_AGENT = 'FreezyFrenzy-Website/1.0';

export function isCloverConfigured(): boolean {
  const m = process.env.CLOVER_MERCHANT_ID?.trim();
  const t = process.env.CLOVER_API_TOKEN?.trim();
  return Boolean(m && t);
}

function cloverBaseUrl(): string {
  const override = process.env.CLOVER_API_BASE_URL?.trim();
  if (override) return override.replace(/\/$/, '');
  const region = process.env.CLOVER_REGION?.trim().toLowerCase() || 'sandbox';
  if (region === 'sandbox') return 'https://apisandbox.dev.clover.com';
  if (region === 'eu') return 'https://api.eu.clover.com';
  if (region === 'la') return 'https://api.la.clover.com';
  return 'https://api.clover.com';
}

function merchantId(): string {
  return process.env.CLOVER_MERCHANT_ID!.trim();
}

function bearerToken(): string {
  return process.env.CLOVER_API_TOKEN!.trim();
}

async function cloverFetch(path: string, init: RequestInit): Promise<Response> {
  const url = `${cloverBaseUrl()}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${bearerToken()}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      ...(init.headers as Record<string, string>),
    },
  });
}

async function readCloverError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: string; error?: string };
    if (typeof j.message === 'string' && j.message) return j.message;
    if (typeof j.error === 'string' && j.error) return j.error;
  } catch {
    /* ignore */
  }
  return res.statusText || 'Clover request failed';
}

function splitName(name: string | undefined): { firstName: string; lastName: string } {
  const t = name?.trim() ?? '';
  if (!t) return { firstName: 'Guest', lastName: 'Customer' };
  const parts = t.split(/\s+/);
  const firstName = parts[0]!.slice(0, 64);
  const rest = parts.slice(1).join(' ').slice(0, 64);
  return { firstName, lastName: rest || 'Customer' };
}

function normalizeUsPhoneDigits(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return null;
}

function toE164Us(digits10: string): string {
  return `+1${digits10}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type CloverCustomerRef = { id: string };

async function postCreateCustomer(body: Record<string, unknown>): Promise<Response> {
  const mId = merchantId();
  return cloverFetch(`/v3/merchants/${mId}/customers`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Try with marketingAllowed; if Clover rejects, retry without (some third-party tokens cannot set it). */
async function createCustomerWithMarketingFallback(
  body: Record<string, unknown>
): Promise<Response> {
  const marketingAllowed = body.marketingAllowed;
  let res = await postCreateCustomer(body);
  if (
    !res.ok &&
    marketingAllowed === true &&
    (res.status === 400 || res.status === 401 || res.status === 403)
  ) {
    const rest = { ...body };
    delete rest.marketingAllowed;
    res = await postCreateCustomer({ ...rest, marketingAllowed: false });
  }
  return res;
}

async function findCustomerIdByEmail(email: string): Promise<string | null> {
  const mId = merchantId();
  const filter = `emailAddress=${email}`;
  const qs = new URLSearchParams({ limit: '5', filter });
  const res = await cloverFetch(`/v3/merchants/${mId}/customers?${qs.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { elements?: { id?: string }[] };
    const id = data.elements?.[0]?.id;
    return typeof id === 'string' ? id : null;
  } catch {
    return null;
  }
}

async function addPhoneNumber(customerId: string, e164: string): Promise<Response> {
  const mId = merchantId();
  return cloverFetch(`/v3/merchants/${mId}/customers/${customerId}/phone_numbers`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: e164 }),
  });
}

export type CloverEmailSignupResult =
  | { ok: true; customerId: string }
  | { ok: false; status: number; error: string };

export async function cloverEmailSignup(body: unknown): Promise<CloverEmailSignupResult> {
  if (!isCloverConfigured()) {
    return { ok: false, status: 503, error: 'Clover is not configured on the server.' };
  }
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid JSON body.' };
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === 'string' ? o.email.trim().toLowerCase() : '';
  const name = typeof o.name === 'string' ? o.name : undefined;
  const cloverRewards = o.cloverRewards === true;
  const emailList = o.emailList === true;
  const emailConsent = o.emailConsent === true;

  if (!email || !isValidEmail(email)) {
    return { ok: false, status: 400, error: 'A valid email is required.' };
  }
  if (!cloverRewards && !emailList) {
    return { ok: false, status: 400, error: 'Select at least one signup option.' };
  }
  if (!emailConsent) {
    return { ok: false, status: 400, error: 'Email consent is required.' };
  }

  const { firstName, lastName } = splitName(name);
  const marketingAllowed = cloverRewards || emailList;

  const payload: Record<string, unknown> = {
    firstName,
    lastName,
    marketingAllowed,
    customerSince: Date.now(),
    emailAddresses: [{ emailAddress: email, primaryEmail: true }],
  };

  const res = await createCustomerWithMarketingFallback(payload);
  if (!res.ok) {
    const msg = await readCloverError(res);
    return { ok: false, status: res.status >= 400 && res.status < 600 ? res.status : 502, error: msg };
  }
  try {
    const created = (await res.json()) as CloverCustomerRef;
    if (!created?.id) {
      return { ok: false, status: 502, error: 'Clover did not return a customer id.' };
    }
    return { ok: true, customerId: created.id };
  } catch {
    return { ok: false, status: 502, error: 'Invalid response from Clover.' };
  }
}

export type CloverPhoneSignupResult =
  | { ok: true; customerId: string }
  | { ok: false; status: number; error: string };

export async function cloverPhoneSignup(body: unknown): Promise<CloverPhoneSignupResult> {
  if (!isCloverConfigured()) {
    return { ok: false, status: 503, error: 'Clover is not configured on the server.' };
  }
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid JSON body.' };
  }
  const o = body as Record<string, unknown>;
  const phoneRaw = typeof o.phone === 'string' ? o.phone : '';
  const customerIdRaw = typeof o.customerId === 'string' ? o.customerId.trim() : '';
  const linkEmail =
    typeof o.linkEmail === 'string' ? o.linkEmail.trim().toLowerCase() : undefined;
  const smsConsent = o.smsConsent === true;

  if (!smsConsent) {
    return { ok: false, status: 400, error: 'SMS consent is required.' };
  }

  const digits = normalizeUsPhoneDigits(phoneRaw);
  if (!digits) {
    return { ok: false, status: 400, error: 'Enter a valid 10-digit U.S. mobile number.' };
  }
  const e164 = toE164Us(digits);

  let customerId = customerIdRaw || null;
  if (!customerId && linkEmail && isValidEmail(linkEmail)) {
    customerId = await findCustomerIdByEmail(linkEmail);
  }

  if (customerId) {
    const res = await addPhoneNumber(customerId, e164);
    if (!res.ok) {
      const msg = await readCloverError(res);
      return { ok: false, status: res.status >= 400 && res.status < 600 ? res.status : 502, error: msg };
    }
    return { ok: true, customerId };
  }

  const payload: Record<string, unknown> = {
    firstName: 'SMS',
    lastName: 'Subscriber',
    marketingAllowed: true,
    customerSince: Date.now(),
    phoneNumbers: [{ phoneNumber: e164 }],
  };
  if (linkEmail && isValidEmail(linkEmail)) {
    payload.emailAddresses = [{ emailAddress: linkEmail, primaryEmail: true }];
  }

  const res = await createCustomerWithMarketingFallback(payload);
  if (!res.ok) {
    const msg = await readCloverError(res);
    return { ok: false, status: res.status >= 400 && res.status < 600 ? res.status : 502, error: msg };
  }
  try {
    const created = (await res.json()) as CloverCustomerRef;
    if (!created?.id) {
      return { ok: false, status: 502, error: 'Clover did not return a customer id.' };
    }
    return { ok: true, customerId: created.id };
  } catch {
    return { ok: false, status: 502, error: 'Invalid response from Clover.' };
  }
}
