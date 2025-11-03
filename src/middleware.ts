import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/api/test']

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  )

  // Get token from cookie
  const token = request.cookies.get('sb-access-token')?.value ||
                request.cookies.get('sb-hrakofsjpivxbepjmthd-auth-token')?.value

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login/signup with valid token
  if (isPublicPath && token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
