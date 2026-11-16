"use client"

import { useState, createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface MessageContextType {
	isAddUserModalOpen: boolean;
	setIsAddUserModalOpen: Dispatch<SetStateAction<boolean>>;
}

const MessageContext = createContext<MessageContextType>({
	isAddUserModalOpen: false,
	setIsAddUserModalOpen: () => {}
});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

	return (
		<MessageContext.Provider value={{isAddUserModalOpen, setIsAddUserModalOpen}}>
			{children}
		</MessageContext.Provider>
	);
}

export const useMessage = () => useContext(MessageContext);