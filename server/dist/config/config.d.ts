import "dotenv/config";
declare const _default: {
    development: {
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
        host: string | undefined;
        dialect: string;
        logging: boolean;
    };
    test: {
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
        host: string;
        dialect: string;
    };
    production: {
        username: string;
        password: null;
        database: string;
        host: string;
        dialect: string;
    };
};
export default _default;
//# sourceMappingURL=config.d.ts.map