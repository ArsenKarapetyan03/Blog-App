import { useEffect, useState } from "react";
import { MessageType } from "@/types/types";
import { Pen, Trash } from "lucide-react";
import { cn } from "@/lib/cn";

interface MessageItemProps {
	msg: MessageType;
	isPartner: boolean;
	onDelete: (messageId: number) => void;
	onStartEdit: (msg: MessageType) => void;
}

export const MessageItem = ({msg, isPartner, onDelete, onStartEdit}: MessageItemProps) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => setIsVisible(true));
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div
			className={cn(
				"flex group relative items-center gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
				isPartner ? "justify-start" : "justify-end",
				isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-98",
			)}
		>
			<div
				className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5 order-first shrink-0">
				{!isPartner &&
            <button
                type="button"
                onClick={() => onStartEdit(msg)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                title="Edit"
            >
                <Pen size={16}/>
            </button>
				}

				<button
					type="button"
					onClick={() => onDelete(msg.id)}
					className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
					title="Delete"
				>
					<Trash size={16}/>
				</button>
			</div>

			<div
				className={cn("max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
					isPartner
						? "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
						: "bg-blue-600 text-white rounded-br-none"
				)}
			>
				<p className="leading-relaxed wrap-break-word">{msg.messageText}</p>
				<span
					className={`block text-[10px] mt-1 text-right ${isPartner ? "text-gray-400" : "text-blue-200"}`}
				>
					{msg.createdAt
						? new Date(msg.createdAt).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})
						: ""}
				</span>
			</div>
		</div>
	);
};
