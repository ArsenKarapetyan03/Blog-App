import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "3d" });
};
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload structure");
    }
    return decoded;
};
//# sourceMappingURL=jwt.js.map