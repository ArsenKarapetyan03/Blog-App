import { userService } from "@/services/user.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";
const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    friends: (user.Friends || []).map((friend) => ({
        id: friend.id,
        name: friend.name,
        email: friend.email,
    })),
});
export const getAll = async (req, res) => {
    const { limit, offset } = getPaginationDirectives(req.query);
    const searchString = String(req.query.query ?? "").trim();
    const currentUserId = res.locals.user?.id;
    const result = await userService.findAll(searchString, limit, offset, currentUserId);
    if (!result) {
        throw new AppError("User not found.", 404);
    }
    const data = {
        users: result.rows,
        totalPages: Math.ceil(result.count / limit || 1)
    };
    return res.status(200).json({ success: true, data });
};
export const getCurrentUser = async (req, res) => {
    const currentUser = res.locals.user;
    if (!currentUser) {
        throw new AppError("Unauthorized. User data not found in request.", 401);
    }
    const foundUser = await userService.findById(currentUser.id);
    if (!foundUser) {
        throw new AppError("User not found.", 404);
    }
    const { incomingRequests, outgoingRequests } = await userService.findPendingRequests(currentUser.id);
    return res.status(200).json({
        success: true,
        user: {
            ...formatUser(foundUser),
            incomingRequests,
            outgoingRequests,
        },
    });
};
export const getOne = async (req, res) => {
    const { id } = req.params;
    const userId = Number(id);
    if (!Number.isSafeInteger(userId)) {
        throw new AppError("Invalid user ID.", 400);
    }
    const user = await userService.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return res.status(200).json({
        success: true,
        user: formatUser(user),
    });
};
//# sourceMappingURL=user.controller.js.map