import { NextResponse } from 'next/server';

export function middleware() {
  // Client-side handles redirecting initially based on context, but let's do a basic layout check 
  // We don't have true JWT verification here without an external call or edge-compatible library,
  // so we'll rely on the client-side AuthProvider for actual layout protection or verify the cookie if we used one.
  // Since we're using localStorage for Token via AuthContext (T009), 
  // Next.js middleware cannot see it unless it's in a cookie. 
  // We'll let `AuthContext` handle unauthenticated client redirects, 
  // but keep this middleware configured to return NextResponse.next() for pattern completion.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
