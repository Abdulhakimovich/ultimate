import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname, search } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAuthCallback = pathname.startsWith('/auth/callback');

  // Allow auth callback through unconditionally
  if (isAuthCallback) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured in env, treat as unauthenticated
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      const nextPath = `${pathname}${search}`;
      if (pathname !== '/' && nextPath) {
        redirectUrl.searchParams.set('next', nextPath);
      }
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use supabase.auth.getSession() on the server!
  // Always use getUser() to validate user session with Supabase auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in
  if (user) {
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/tracker';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // If user is NOT logged in
  if (!isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    const nextPath = `${pathname}${search}`;
    if (pathname !== '/' && nextPath) {
      redirectUrl.searchParams.set('next', nextPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, logo.png, icon.png, apple-icon.png
     * - manifest.json, sw.js
     * - static asset extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|logo\\.png|icon\\.png|apple-icon\\.png|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ico)$).*)',
  ],
};
