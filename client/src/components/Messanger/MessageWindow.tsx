"use client";

import { use } from "react";
import { UserWithLastMessage, MessageType } from "@/types/types";

interface MessageWindowProps {
	partner: UserWithLastMessage["chatPartner"];
	token: string;
	messagesPromise: Promise<MessageType[]>;
	onMessageSent: () => void;
}

export const MessageWindow = ({ partner, token, messagesPromise, onMessageSent }: MessageWindowProps) => {
	// React 19 автоматически распаковывает Promise.
	// Больше никакого useEffect, useState и ручной синхронизации стадий загрузки.
	const messages = use(messagesPromise);

	return (
		<div className="flex flex-1 flex-col h-full overflow-hidden bg-white">
			{/* Шапка чата */}
			<div className="flex items-center border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
				<div>
					<h3 className="font-bold text-gray-900">{partner.name}</h3>
					<p className="text-xs text-green-500">Chat Session Active</p>
				</div>
			</div>

			{/* Область сообщений */}
			<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-center">
						<p className="text-sm text-gray-400 max-w-xs">
							No messages here yet. Direct messsages are secured and encrypted.
						</p>
					</div>
				) : (
					messages.map((msg) => {
						// Определяем, кто отправитель (предполагаем поле senderId или аналогичное)
						const isPartner = msg.senderId === partner.id;

						return (
							<div
								key={msg.id}
								className={`flex ${isPartner ? "justify-start" : "justify-end"}`}
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
										{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
									</span>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Форма ввода текста */}
			<div className="border-t border-gray-100 bg-white p-4">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						// Ваша логика отправки сообщения, которая в конце вызывает onMessageSent()
					}}
					className="flex items-center gap-2"
				>
					<input
						type="text"
						placeholder="Type a message..."
						className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
					/>
					<button
						type="submit"
						className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
};

export default MessageWindow;
