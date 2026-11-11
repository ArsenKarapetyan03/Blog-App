export declare const messageService: {
    getMessages: (chatId: number, offset: number) => Promise<import("../models/message.js").Message[]>;
    getChatsWithLastMessage: (currentUserId: number) => Promise<object[]>;
    createMessage: (senderId: number, chatId: number, messageText: string) => Promise<import("sequelize").InferAttributes<import("../models/message.js").Message, {
        omit: never;
    }>>;
    markMessagesAsRead: (userId: number, chatId: number) => Promise<Date | null>;
    updateMessage: (senderId: number, messageId: number, messageText: string) => Promise<import("sequelize").InferAttributes<import("../models/message.js").Message, {
        omit: never;
    }> | null>;
    deleteMessage: (senderId: number, messageId: number) => Promise<import("sequelize").InferAttributes<import("../models/message.js").Message, {
        omit: never;
    }> | null>;
};
//# sourceMappingURL=message.service.d.ts.map