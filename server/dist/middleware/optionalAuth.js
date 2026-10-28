import { verifyToken } from "@/utils/jwt.js";
export const optionalAuth = (req, res, next) => {
    res.locals.user = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (token) {
            try {
                const decoded = verifyToken(token);
                res.locals.user = {
                    id: Number(decoded.id),
                    email: decoded.email
                };
            }
            catch (err) {
                res.locals.user = undefined;
            }
        }
    }
    return next();
};
//# sourceMappingURL=optionalAuth.js.map