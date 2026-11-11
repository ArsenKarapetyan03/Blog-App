import { useMemo } from "react";
import { ChatType, UserType } from "@/types/types";
import { InfoRow } from "@/components/ui/InfoRow";
import { cn } from "@/lib/cn";
import { getChatTitle } from "@/lib/helperFunctions";

interface ChatsProps {
	chats: ChatType[];
	activeChatId: number | null;
	friends: UserType[];
	currentUserId: number;
	onSelectChat: (id: number) => void;
	onStartChatWithFriend: (friend: UserType) => void;
}

export const Chats = (
	{
		chats,
		activeChatId,
		friends,
		currentUserId,
		onSelectChat,
		onStartChatWithFriend
	}: ChatsProps) => {

	const friendsWithoutChats = useMemo(() => {
		const userIdsWithChats = new Set<number>();

		chats.forEach((chat) => {
			if (chat.users && Array.isArray(chat.users)) {
				chat.users.forEach((u) => {
					if (u.id !== currentUserId) {
						userIdsWithChats.add(u.id);
					}
				});
			}
			if (chat.id < 0) {
				userIdsWithChats.add(Math.abs(chat.id));
			}
		});

		return friends.filter((friend) => !userIdsWithChats.has(friend.id));
	}, [chats, friends, currentUserId]);

	return (
		<div className="divide-y divide-gray-100 max-h-140 overflow-y-auto">
			{chats.length === 0 ? (
				<div className="p-8 text-center text-gray-500 text-sm">No active chats</div>
			) : (
				chats.map((chat) => {
					const isActive = chat.id === activeChatId;

					const isIncoming = chat.lastMessage && chat.lastMessage.senderId !== currentUserId;
					const showUnreadIndicator = chat.lastMessage && !chat.lastMessage.isRead && isIncoming;

					const isSentByMe = chat.lastMessage && chat.lastMessage.senderId === currentUserId;

					return (
						<button
							key={chat.id}
							onClick={() => onSelectChat(chat.id)}
							className={cn(
								"flex flex-col p-4 hover:bg-gray-50 transition-colors w-full min-w-0 text-left",
								isActive && "bg-blue-50/70"
							)}
						>
							<InfoRow
								name={getChatTitle(chat, currentUserId)}
								createdAt={chat.lastMessage?.createdAt}
							/>

							<div className="flex items-center justify-between gap-2 w-full min-w-0 mt-1">
								{chat.lastMessage && (
									<>
										<p className={cn(
											"text-sm truncate flex-1 min-w-0",
											!chat.lastMessage.isRead && isIncoming
												? "font-semibold text-gray-900"
												: "text-gray-500"
										)}>
											{isSentByMe && <span className="text-gray-400 mr-1">You:</span>}

											{chat.lastMessage.messageText}
										</p>

										{showUnreadIndicator && (
											<span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 animate-pulse ml-2" />
										)}
									</>
								)}
							</div>
						</button>
					);
				})
			)}

			{friendsWithoutChats.length > 0 && (
				<div className="mt-24">
					<div className="p-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 backdrop-blur border-b border-gray-100">
						Friends (No messages yet)
					</div>

					<div>
						{friendsWithoutChats.map((friend) => (
							<button
								key={friend.id}
								onClick={() => onStartChatWithFriend(friend)}
								className="flex flex-col p-4 border-y border-zinc-50 hover:bg-gray-50 transition-colors w-full text-left"
							>
								<InfoRow name={friend.name} />
								<p className="text-xs text-gray-400 truncate mt-0.5 px-4">
									Click to start a conversation
								</p>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
