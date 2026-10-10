import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "#models/index.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req: Request, res: Response) => {
	try {
		const {name, email, password} = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "All fields (name, email, password) are required."
			});
		}

		const userExists = await db.User.findOne({where: {email}});

		if (userExists) {
		  return res.status(409).json({success: false, message: "Email already registered."});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await db.User.create({name, email, password: hashedPassword});

		return res.status(201).json({
			success: true,
			message: "User registered successfully.",
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email
			}
		});
	} catch (error) {
		console.error("Error in create user:", error);

		return res.status(500).json({success: false, message: "Internal server error."});
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const {email, password} = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required."
			});
		}

		const user = await db.User.findOne({where: {email}});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials."
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials."
			});
		}

		const token = generateToken({id: user.id, email: user.email});

		return res.status(200).json({
			success: true,
			message: "Login successful.",
			token
		});

	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({
			success: false,
			message: "An error occurred during login."
		});
	}
}