import type { Request, Response } from "express";
import { AppError } from "@/utils/appError.js";
import { friendshipService } from "@/services/friendship.service.js";

export const add = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const friendId = res.locals.friendId;

	const existingRelation = await friendshipService.find(userId, friendId);

	if (existingRelation) {
		if (existingRelation.status === "accepted") {
			return res.status(400).json({ success: false, message: "You are already friends" });
		}

		if (existingRelation.status === "blocked") {
			return res.status(400).json({ success: false, message: "Action not allowed" });
		}

		if (existingRelation.requesterId === userId) {
			return res.status(400).json({ success: false, message: "Friendship request already sent by you" });
		} else {
			return res.status(400).json({ success: false, message: "This user has already sent you a friend request" });
		}
	}

	const response = await friendshipService.create(userId, friendId);

	if (!response || !response.success) {
		throw new AppError("Failed to create friendship request", 500);
	}

	return res.status(200).json({success: true, message: "Request is sent successfully", friendId});
};

export const accept = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const friendId = res.locals.friendId;

	const request = await friendshipService.find(userId, friendId);

	if (!request) {
		return res.status(404).json({ success: false, message: "Friendship request not found" });
	}

	if (request.status === "accepted") {
		return res.status(400).json({ success: false, message: "You are already friends" });
	}

	if (request.requesterId === userId) {
		return res.status(400).json({ success: false, message: "You cannot accept your own pending request" });
	}

	if (request.requesterId !== friendId) {
		return res.status(400).json({ success: false, message: "This request was not initiated by this user" });
	}

	const response = await friendshipService.updateStatus(userId, friendId, "accepted");

	if (!response || !response.success) {
		throw new AppError("Failed to accept friendship request", 500);
	}

	return res.status(200).json({ success: true, message: "Friend request accepted successfully", friendId });
};

export const remove = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const friendId = res.locals.friendId;

	const response = await friendshipService.delete(userId, friendId);

	if (!response || !response.success) {
		return res.status(404).json({ success: false, message: "Friendship or request not found" });
	}

	return res.status(200).json({ success: true, message: "Friendship or request removed successfully", friendId });
}