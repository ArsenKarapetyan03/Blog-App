import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { productService } from "@/services/product.service.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";

export const getAllProducts = async (req: Request, res: Response) => {
	const { limit, offset } = getPaginationDirectives(req.query);
	const searchString = String(req.query.query ?? "").trim();

	const result = await productService.getAllProducts({ searchString, limit, offset });

	const responseData = {
		products: result.products,
		totalPages: Math.ceil(result.count / limit || 1)
	};

	return res.status(200).json({	success: true, data: responseData	});
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