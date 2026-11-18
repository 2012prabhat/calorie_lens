import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const getUserFromToken = async (req) => {
  try {
    let token = null;

    // 1. Try reading from req.cookies (NextRequest)
    if (req?.cookies && typeof req.cookies.get === "function") {
      token = req.cookies.get("token")?.value;
    }

    // 2. Try reading from Next.js next/headers cookies()
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
      } catch (e) {
        // cookies() may throw outside Next.js request context
      }
    }

    // 3. Try reading from Authorization header (Bearer token)
    if (!token && req?.headers) {
      const authHeader = typeof req.headers.get === "function" 
        ? req.headers.get("authorization") 
        : req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) return null;

    const secret = process.env.JWT_SECRET || "fallback_secret_key_for_development";
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error("getUserFromToken error:", error.message);
    return null;
  }
};
