import type { Request, Response } from "express";
import { messageService } from "@/services/message.service.js";

export const getMessages = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

}

export const getChats = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const response = await messageService.getMessage(userId);

	const chatUsers = response.rows.map(message => ({receiverId: message.receiverId}))

	res.status(200).json({success: true, chatUsers});
}