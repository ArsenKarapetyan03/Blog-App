export const activeUsers = new Map();
export const broadcastToUser = (userId, data) => {
    const stringified = JSON.stringify(data);
    activeUsers.get(userId)?.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(stringified);
        }
    });
};
//# sourceMappingURL=active-users.js.map