import type { Request, Response } from "express";
import { AppError } from "@/utils/appError.js";
import { friendshipService } from "@/services/friendship.service.js";

export const add = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	const userId = Number(req.user.id);
	const friendId = Number(req.body.friendId);

	if (!Number.isSafeInteger(userId) || !Number.isSafeInteger(friendId)) {
		return res.status(400).json({ success: false, message: "Invalid user identifiers provided" });
	}

	if (userId === friendId) {
		return res.status(400).json({	success: false,	message: "You cannot add yourself to friends"	});
	}

	const alreadyRequested = await friendshipService.find(userId, friendId);
	const incomingRequest = await friendshipService.find(friendId, userId);

	if (alreadyRequested || incomingRequest) {
		return res.status(400).json({ success: false, message: "Friendship request already exists" });
	}

	const response = await friendshipService.create(userId, friendId);

	if (!response || !response.success) {
		throw new AppError("Failed to create friendship request", 500);
	}

	return res.status(200).json({success: true, message: "Request is sent successfully", friendId});
};

export const accept = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	const userId = Number(req.user.id);
	const friendId = Number(req.body.friendId);

	if (!Number.isSafeInteger(userId) || !Number.isSafeInteger(friendId)) {
		return res.status(400).json({ success: false, message: "Invalid user identifiers provided" });
	}

	if (userId === friendId) {
		return res.status(400).json({ success: false, message: "You cannot add yourself to friends" });
	}

	const incomingRequest = await friendshipService.find(friendId, userId);

	if (!incomingRequest) {
		return res.status(404).json({ success: false, message: "Friendship request not found" });
	}

	if (incomingRequest.status === "accepted") {
		return res.status(400).json({ success: false, message: "You are already friends" });
	}

	const response = await friendshipService.update(friendId, userId, "accepted");

	if (!response || !response.success) {
		throw new AppError("Failed to accept friendship request", 500);
	}

	return res.status(200).json({ success: true, message: "Friend request accepted successfully", friendId });
};

export const remove = async (req: Request, res: Response) => {

}

// console.log(friendshipService.getFriendsList(2));