import { ChatList } from "@/components/Messanger/ChatList";
import { MessageProvider } from "@/context/MessageContext";

const MessagesPage = () => {
	return (
		<div>
			<MessageProvider>
				<ChatList />
			</MessageProvider>
		</div>
	)
}

export default MessagesPage;