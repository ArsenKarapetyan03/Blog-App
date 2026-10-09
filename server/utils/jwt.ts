import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is not defined in environment variables.");
}

interface TokenPayload extends jwt.JwtPayload {
	id: number | string;
	email: string;
}

export const generateToken = (payload: TokenPayload): string => {
	return jwt.sign(payload, JWT_SECRET, {expiresIn: "1d"});
};

export const verifyToken = (token: string): TokenPayload => {
	const decoded = jwt.verify(token, JWT_SECRET);

	if (typeof decoded === 'string') {
		throw new Error('Invalid token payload structure');
	}

	return decoded as TokenPayload;
};