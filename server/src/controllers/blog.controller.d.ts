import type { Request, Response } from "express";
export declare const getPosts: (_req: Request, res: Response) => Promise<void>;
export declare const createPost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=blog.controller.d.ts.map