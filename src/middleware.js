import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/' || path === '/login' || path === '/signup' || path === '/verifyemail' || path === '/forgotpassword' || path === '/resetpassword';

    const token = request.cookies.get('token')?.value || '';

    // If attempting to access login/signup while logged in, redirect to dashboard
    // But don't redirect if we are already on the home page
    if (isPublicPath && token && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }

    // If attempting to access protected route while NOT logged in, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/profile/:path*',
        '/history/:path*',
        '/plan',
        '/login',
        '/signup',
        '/verifyemail',
        '/forgotpassword',
        '/resetpassword'
    ]
}
