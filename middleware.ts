import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSecurityHeaders } from '@/lib/security-headers';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/protected(.*)',
  '/upload(.*)',
  '/documents(.*)',
  '/integrations(.*)',
  '/settings(.*)',
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks(.*)',
  '/api/health',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

const isApiRoute = createRouteMatcher(['/api(.*)']);



export default clerkMiddleware(async (auth, req) => {
  try {
    // Allow public API routes
    if (isPublicApiRoute(req)) {
      return;
    }

    // Protect authenticated routes
    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    // Temporarily disable all custom headers for debugging
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    throw error;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};