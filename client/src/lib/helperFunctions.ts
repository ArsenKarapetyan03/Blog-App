export const getChatTitle = (chat, currentUserId) => {
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
}