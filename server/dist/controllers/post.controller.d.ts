import type { Request, Response } from "express";
export declare const readAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const readMine: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const readOne: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const remove: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleLike: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=post.controller.d.ts.map