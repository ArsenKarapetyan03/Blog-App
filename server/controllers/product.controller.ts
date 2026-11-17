import type { Request, Response } from "express";

export const getAllProducts = async (req: Request, res: Response) => {
	return res.status(200).json({product: "phone"})
}

export const createProduct = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;


}