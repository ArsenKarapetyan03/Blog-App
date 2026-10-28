import jwt from "jsonwebtoken";
interface TokenPayload extends jwt.JwtPayload {
    id: number;
    email: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map