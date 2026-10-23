import { verifyToken } from "@/utils/jwt.js";
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required. Please sign-in." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication required. Please sign-in." });
    }
    try {
        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        req.user = { id: decoded.id, email: decoded.email };
        return next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};
//# sourceMappingURL=authMiddleware.js.map