"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePostForm = void 0;
const validatePostForm = (formData) => {
    const title = formData.get("title")?.toString().trim();
    const excerpt = formData.get("excerpt")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    if (!title || !excerpt || !description) {
        return null;
    }
    return { title, excerpt, description };
};
exports.validatePostForm = validatePostForm;
//# sourceMappingURL=validatePostForm.js.map