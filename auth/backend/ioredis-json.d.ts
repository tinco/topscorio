declare module "ioredis-json" {
    export default class IORedis {
        constructor(s: string);
        get(key: string, path: string): Promise<any>;
        set(key: string, path: string, value: any): Promise<boolean>;
        on(event: string, handler: (error: any) => void): void;
    }
}