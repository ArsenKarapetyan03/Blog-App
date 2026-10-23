import { verifyToken } from "@/utils/jwt.js";
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            if (!token) {
                throw new Error("Unauthorized");
            }
            const decoded = verifyToken(token);
            req.user = { id: decoded.id, email: decoded.email };
        }
        catch (err) {
            req.user = undefined;
        }
    }
    next();
};
//# sourceMappingURL=optionalAuth.js.map