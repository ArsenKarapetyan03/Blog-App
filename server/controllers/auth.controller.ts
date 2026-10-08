import bcrypt from "bcrypt";
import db from "@/models";

export const create = async (req, res) => {
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
		  return res.status(400).json({success: false, message: "Email already registered."});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

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