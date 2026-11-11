"use client";

import { getChatTitle } from "@/lib/helperFunctions";
import { ChatType } from "@/types/types";
import { Ellipsis, Pen } from "lucide-react";
import { RefObject, useState } from "react";
import { Drawer } from "antd";

export const MessageWindowHeader = (
	{
		chat,
		currentUserId,
		headerRef
	}: {
		chat: ChatType,
		currentUserId: number,
		headerRef: RefObject<HTMLDivElement | null>
	}
) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);


	return (
		<div ref={headerRef} className="flex justify-between px-6 py-4 shadow-sm border-b border-gray-100 bg-white">
			<div>
				<h3 className="font-bold text-gray-900">
					{getChatTitle(chat, currentUserId)}
				</h3>
				{chat.isGroup
					&& <p className="text-xs text-gray-500">
                Members: {chat.users?.length || 0}
            </p>
				}
			</div>

			<button
				className=""
				onClick={() => setIsDrawerOpen(true)}
			>
				<Ellipsis className="text-zinc-500 hover:bg-black/5 transition rounded" />
			</button>

			<Drawer
				open={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				getContainer={() => headerRef.current || document.body}
				rootStyle={{ position: "absolute" }}
			>
				<h3 className="flex justify-between text-lg font-bold text-gray-900">
					{getChatTitle(chat, currentUserId)}
					<Pen size={16} />
				</h3>
			</Drawer>
		</div>
	)
}