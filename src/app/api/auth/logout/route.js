import { NextResponse } from "next/server";

const clearCookieResponse = () => {
    const response = NextResponse.json({
        message: "Logout successful",
        success: true,
    });
    
    // Explicitly expire the token cookie on root path
    response.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        expires: new Date(0)
    });

    // Also call delete for Next.js internal cookie jar
    response.cookies.delete("token");

    return response;
};

export async function GET() {
    try {
        return clearCookieResponse();
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        return clearCookieResponse();
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
