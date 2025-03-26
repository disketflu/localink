import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting configuration
const RATE_LIMIT = 100 // requests
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

// Store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>()

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Skip rate limiting for static files and API routes that don't need it
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Get client IP from headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

  // Check rate limit
  const now = Date.now()
  const rateLimitInfo = rateLimit.get(ip)

  if (rateLimitInfo) {
    if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW) {
      // Reset if window has passed
      rateLimit.set(ip, { count: 1, timestamp: now })
    } else if (rateLimitInfo.count >= RATE_LIMIT) {
      // Rate limit exceeded
      return new NextResponse("Too Many Requests", { status: 429 })
    } else {
      // Increment count
      rateLimitInfo.count++
    }
  } else {
    // First request
    rateLimit.set(ip, { count: 1, timestamp: now })
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (auth endpoints)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
} 