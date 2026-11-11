import { AppError } from "@/utils/ErrorHandlers/app.error.js";
export const catchAsyncWs = (handler) => {
    return async (ws, rawData) => {
        try {
            await handler(ws, rawData);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        payload: { statusCode: 400, message: "Invalid JSON format" }
                    }));
                }
                return;
            }
            if (error instanceof AppError) {
                console.warn(`[WS Operational Error] ${error.statusCode}: ${error.message}`);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        payload: { statusCode: error.statusCode, message: error.message }
                    }));
                }
                return;
            }
            console.error("Unhandled WS Error: ", error);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "ERROR",
                    payload: { statusCode: 500, message: "Internal server error." }
                }));
            }
        }
    };
};
//# sourceMappingURL=ws.error.js.map