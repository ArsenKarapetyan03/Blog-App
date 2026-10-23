export declare const deletePhysicalFiles: (imagePaths: string[]) => Promise<{
    success: boolean;
    message: string;
    details?: never;
} | {
    success: boolean;
    message: string;
    details: ({
        path: string;
        status: string;
        error?: never;
    } | {
        path: string;
        status: string;
        error: any;
    })[];
}>;
//# sourceMappingURL=deleteFiles.d.ts.map