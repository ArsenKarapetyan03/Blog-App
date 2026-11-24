import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { productService } from "@/services/product.service.js";

export const getAllProducts = async (req: Request, res: Response) => {
	const products = await productService.getAllProducts();

	return res.status(200).json({	success: true, data: products	});
};

export const getProductById = async (req: Request, res: Response) => {
	const productId = Number(req.params.id);

	if (isNaN(productId)) {
		throw new AppError("Invalid product ID", 400);
	}

	const product = await productService.getProductById(productId);

	return res.status(200).json({ success: true, data: product });
};

export const getMyProducts = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const products = await productService.getUserProducts(userId);
	return res.status(200).json({	success: true, data: products	});
};