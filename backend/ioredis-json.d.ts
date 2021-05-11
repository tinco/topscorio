declare module "ioredis-json" {
    export default class IORedis {
        constructor(s: string);
        get(key: string, path: string): Promise<any>;
        set(key: string, path: string, value: any): Promise<boolean>;
        on(event: string, handler: (error: any) => void): void;
        arrappend(key: string, path: string, items: any[]): Promise<number>
        arrtrim(key: string, path: string, start: number, end: number): Promise<number>
    }
}