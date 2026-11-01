import { useEffect, useState } from "react";
import { MessageType } from "@/types/types";

export const MessageItem = ({ msg, isPartner }: { msg: MessageType; isPartner: boolean }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => setIsVisible(true));
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div
			className={`flex ${isPartner ? "justify-start" : "justify-end"} 
				transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
				${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-98"}`}
		>
			<div
				className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
					isPartner
						? "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
						: "bg-blue-600 text-white rounded-br-none"
				}`}
			>
				<p className="leading-relaxed break-words">{msg.messageText}</p>
				<span
					className={`block text-[10px] mt-1 text-right ${
						isPartner ? "text-gray-400" : "text-blue-200"
					}`}
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