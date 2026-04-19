import jwt from "jsonwebtoken";

export const getDataFromToken = (request) => {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) return null;
        
        const tokenSecret = process.env.JWT_SECRET || "fallback_secret_key_for_development";
        const decodedToken = jwt.verify(token, tokenSecret);
        return decodedToken.id;
    } catch (error) {
        throw new Error(error.message);
    }
}
