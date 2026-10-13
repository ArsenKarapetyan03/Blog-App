import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { userService } from "@/services/user.service.js";
import { generateToken } from "@/utils/jwt.js";
import { AppError } from "@/utils/appError.js";

export const signUp = async (req: Request, res: Response) => {
	const {name, email, password} = req.body || {};

	if (!name || !email || !password) {
		throw new AppError("All fields (name, email, password) are required.", 400);
	}

	const userExists = await userService.findByEmail(email);
	if (userExists) {
		throw new AppError("Email already registered.", 409);
	}

	const newUser = await userService.createUser({name, email, password});

	return res.status(201).json({
		success: true,
		message: "User registered successfully.",
		user: {
			id: newUser.id,
			name: newUser.name,
			email: newUser.email
		}
	});
};

export const signIn = async (req: Request, res: Response) => {
	const {email, password} = req.body || {};

	if (!email || !password) {
		throw new AppError("Email and password are required.", 400);
	}

	const user = await userService.findByEmail(email);
	if (!user) {
		throw new AppError("Invalid credentials.", 401);
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new AppError("Invalid credentials.", 401);
	}

	const token = generateToken({id: user.id, email: user.email});

	return res.status(200).json({
		success: true,
		message: "Login successful.",
		token,
		user: {id: user.id, name: user.name, email: user.email}
	});
};

export const getUser = async (req: Request, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new AppError("Unauthorized. User data not found in request.", 401);
	}

	const foundUser = await userService.findById(user.id);
	if (!foundUser) {
		throw new AppError("User not found.", 404);
	}

	return res.status(200).json({
		success: true,
		user: {
			id: foundUser.id,
			name: foundUser.name,
			email: foundUser.email
		},
	});
};