import type { Transaction } from "sequelize";
interface Image {
    imagePath: string;
}
export declare const imageService: {
    createImages: (postId: number, images: Image[], transaction?: Transaction) => Promise<import("../models/image.js").Image[]>;
    deleteImages: (postId: number, imagePaths: string[], transaction?: Transaction) => Promise<number>;
};
export {};
//# sourceMappingURL=image.service.d.ts.map