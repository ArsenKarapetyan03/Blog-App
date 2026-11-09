import { ChatType } from "@/types/types";
import { InfoRow } from "@/components/ui/InfoRow";
import { cn } from "@/lib/cn";

interface ChatsProps {
	chats: ChatType[];
	activeChatId: number | null;
	currentUserId: number;
	onSelectChat: (id: number) => void;
}

export const Chats = ({ chats, activeChatId, currentUserId, onSelectChat }: ChatsProps) => (
	<div className="divide-y divide-gray-100 max-h-140 overflow-y-auto">
		{chats.length === 0 ? (
			<div className="p-8 text-center text-gray-500">No active chats</div>
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
							name={chat.title || "Group chat"}
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
	</div>
);
