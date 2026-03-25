import { NextResponse } from 'next/server';

// M3: Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 3600000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

const VALID_SERVICES = ['sip', 'swp', 'retirement', 'goal', 'tax', 'general', 'elss', 'other'];

export async function POST(request: Request) {
  try {
    // M3: Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ success: false, errors: ['Too many requests. Please try again later.'] }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, service, message, website } = body;

    // Honeypot check — bots fill hidden fields
    if (website) {
      return NextResponse.json({ success: true });
    }

    const errors: string[] = [];

    // M2: Validate service field
    if (service && !VALID_SERVICES.includes(service)) {
      errors.push('Invalid service selected.');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required.');
    } else if (name.length > 100) {
      errors.push('Name must be 100 characters or fewer.');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('A valid email is required.');
    } else if (email.length > 254) {
      errors.push('Email must be 254 characters or fewer.');
    }

    if (phone && (typeof phone !== 'string' || phone.length > 15)) {
      errors.push('Phone must be 15 characters or fewer.');
    } else if (phone && !/^[+\d\s()-]{7,15}$/.test(phone)) {
      errors.push('Phone format is invalid.');
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      errors.push('Message is required.');
    } else if (message.length > 2000) {
      errors.push('Message must be 2000 characters or fewer.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Send to Google Sheets via Apps Script webhook
    const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() || '',
            service: service || '',
            message: message.trim(),
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // Don't fail the user submission if sheet write fails
        console.error('Failed to write to Google Sheet');
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, errors: ['Invalid request.'] }, { status: 400 });
  }
}
