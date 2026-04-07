import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail' || path === '/forgotpassword' || path === '/resetpassword';

    const token = request.cookies.get('token')?.value || '';

    // If attempting to access login/signup while logged in, redirect to profile
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    // If attempting to access protected route while NOT logged in, redirect to login
    if (!isPublicPath && !token && path.startsWith('/profile')) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/profile',
        '/profile/:path*',
        '/login',
        '/signup',
        '/verifyemail',
        '/forgotpassword',
        '/resetpassword'
    ]
}
