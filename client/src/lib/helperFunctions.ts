import { ChatType } from "@/types/types";

export const getChatTitle = (chat: ChatType, currentUserId: number) => {
	if (chat.title) {
		return chat.title;
	}

	const otherUsers = chat.users.filter(user => user.id !== currentUserId);

	if (otherUsers.length === 0) {
		return "Group chat";
	}

	const usersSummary = otherUsers
		.slice(0, 3)
		.map(user => user.name || "Unknown")
		.join(', ');

	return otherUsers.length > 3 ? `${usersSummary}...` : usersSummary;
};

export const formatPrice = (unitAmount?: number, currency: string = "usd") => {
	if (unitAmount === undefined || unitAmount === null) return null;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
	}).format(unitAmount / 100);
};