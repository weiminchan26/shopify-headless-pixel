type FunType = (...args: any[]) => unknown;

export {};

declare global {
    interface Window {
        WorkmagicPixelData: {
            version: string;
            tenantId: string;
            tenantIdSign: string;
        };
        [key: string]: string | number | boolean | any[] | FunType;
    }
}
