type FunType = (...args: any[]) => unknown;

export {};

declare global {
    interface Window {
        WorkmagicPixelData: {
            version: string;
            platform: string;
            isHeadless: boolean;
        };
        [key: string]: string | number | boolean | any[] | FunType;
    }
}
