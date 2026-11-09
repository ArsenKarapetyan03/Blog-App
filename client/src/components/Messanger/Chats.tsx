import { UserWithLastMessage } from "@/types/types";
import { InfoRow } from "@/components/ui/InfoRow";
import { cn } from "@/lib/cn";

interface ChatsProps {
	chats: UserWithLastMessage[];
	activeChatId: number | null;
	onSelectChat: (id: number) => void;
}

export const Chats = ({chats, activeChatId, onSelectChat}: ChatsProps) => (
	<div className="divide-y divide-gray-100 max-h-140 overflow-y-auto">
		{chats.length === 0 ? (
			<div className="p-8 text-center text-gray-500">No active chat</div>
		) : (
			chats.map((chat) => {
				const isActive = chat.id === activeChatId;
				// const isIncoming = chat.lastMessage.senderId === .id;
				// const showUnreadIndicator = !chat.lastMessage.isRead && isIncoming

				return (
					<button
						key={chat.id}
						onClick={() => onSelectChat(chat.id)}
						className={cn(
							"flex flex-col p-4 hover:bg-gray-50 transition-colors w-full min-w-0",
							isActive && "bg-blue-50/70"
						)}
					>
						<InfoRow name={chat.title} createdAt={chat.lastMessage?.createdAt} />

						<div className="flex items-center justify-between gap-2 w-full min-w-0">
							{chat.lastMessage
								&& <>
	                  <p className={`text-sm truncate ${!lastMessage.isRead ? "font-medium text-gray-900" : "text-gray-500"}`}>
											{chat.lastMessage.senderId !== chatPartner.id && <span className="text-gray-400 mr-1">You:</span>}
											{chat.lastMessage.messageText}
	                  </p>

									{showUnreadIndicator && <span className="w-3 h-3 bg-blue-600 rounded-full shrink-0 animate-pulse"/>}
	              </>}
						</div>
					</button>
				)
			})
		)}
	</div>
);
