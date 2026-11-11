import { useEffect, useState } from "react";
import { MessageType, UserType } from "@/types/types";
import { Pen, Trash } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "antd";

interface MessageItemProps {
	msg: MessageType;
	currentUserId: number;
	chatUsers: UserType[];
	onDelete: (messageId: number) => void;
	onStartEdit: (msg: MessageType) => void;
}

function areDatesEqual(dateStr1: string, dateStr2: string): boolean {
	const d1 = new Date(dateStr1.replace(" ", "T"));
	const d2 = new Date(dateStr2.replace(" ", "T"));

	d1.setMilliseconds(0);
	d2.setMilliseconds(0);

	return d1.getTime() === d2.getTime();
}

export const MessageItem = (
	{ msg, currentUserId, chatUsers, onDelete, onStartEdit }: MessageItemProps
) => {
	const [isVisible, setIsVisible] = useState(false);

	const isIncoming = msg.senderId !== currentUserId;

	const showDeleteConfirm = () => {
		Modal.confirm({
			title: "Are you sure delete this message?",
			content: "This action cannot be undone.",
			okText: "Delete",
			okType: "danger",
			centered: true,
			icon: <Trash size={20} className="text-red-500"/>,
			async onOk() {
				onDelete(msg.id);
			},
		});
	};

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => setIsVisible(true));
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div
			className={cn(
				"flex group relative items-center gap-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
				isIncoming ? "justify-start" : "justify-end",
				isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-98",
			)}
		>
			{!isIncoming && !msg.isDeleted && (
				<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 shrink-0 order-first">
					<button
						type="button"
						onClick={() => onStartEdit(msg)}
						className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
						title="Edit"
					>
						<Pen size={16} />
					</button>

					<button
						type="button"
						onClick={showDeleteConfirm}
						className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
						title="Delete"
					>
						<Trash size={16} />
					</button>
				</div>
			)}

			{isIncoming && (
				<div className="flex items-center shrink-0 self-end mb-1">
					<span
						className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
						{chatUsers?.find(user => user.id === msg.senderId)?.name[0] || ""}
					</span>
				</div>
			)}

			<div className="flex flex-col max-w-[70%]">
				{isIncoming && !msg.isDeleted && (
					<span className="text-[11px] font-medium text-gray-500 ml-2 mb-0.5">
				{chatUsers?.find(user => user.id === msg.senderId)?.name || "Chat member"}
			</span>
				)}

				<div
					className={cn(
						"rounded-2xl px-4 py-2.5 text-sm shadow-sm w-full",
						isIncoming
							? "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
							: "bg-blue-600 text-white rounded-br-none",
						msg.isDeleted && "bg-zinc-100 text-zinc-400",
					)}
				>
					<p className="leading-relaxed break-words whitespace-pre-wrap">{msg.messageText}</p>

					<span className={cn("block text-[10px] mt-1 text-right selection:bg-transparent", isIncoming ? "text-gray-400" : "text-blue-200")}>
				{areDatesEqual(msg.createdAt, msg.updatedAt) || msg.isDeleted
					? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
					: <div className="space-x-1 inline-flex items-center">
							<span>{new Date(msg.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
							<Pen size={10} className="inline" />
						</div>
				}
			</span>
				</div>
			</div>
		</div>
	);
};
