import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/api/webhooks(.*)',
]);

// Define admin routes that require special permissions
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Check for admin access on admin routes
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    
    // Check if user has admin role (you can customize this logic)
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (metadata?.role !== 'admin') {
      return new Response('Unauthorized', { status: 401 });
    }
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