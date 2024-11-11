import Pixel from "./pixel";
type FunType = (...args: any[]) => unknown;



// 主函数
(function (windowObject: Window, identifier: string, localStorage: Storage) {

    // 检查是否已经初始化
    if (!windowObject[identifier + 'cnt']) {
        windowObject[identifier + 'cnt'] = 1;
        
        if (!windowObject[identifier]) {
            windowObject['event_queue'] = [];
            windowObject['installed'] = true;
            // 初始化事件队列
            windowObject[identifier] = function (eventName, eventData = {}) {
                if (eventName === 'init') {
                    (windowObject['event_queue'] as any[]) = [];
                    windowObject['WorkmagicPixelData'] = eventData;
                    // localStorage.setItem(identifier + 'U', JSON.stringify(eventData));
                    new Pixel();
                    return;
                }
                const metaTag = document.querySelector('meta[name="serialized-graphql"]');
                const tenantId = eventData.WorkmagicPixelData?.tenantId || '';
                // 当 App pixel 检测存在时，return
                // @ts-ignore
                if (
                    document.querySelector('script#web-pixels-manager-setup') ||
                    // @ts-ignore
                    (metaTag?.content.includes('tenantId') && metaTag?.content.includes(tenantId))
                ) {
                    return;
                }
                const uniqueID = crypto.randomUUID();
                const utcString = new Date().toISOString();
                (windowObject['event_queue'] as any[]).push({
                    eventId: uniqueID,
                    eventName: eventName,
                    eventTime: utcString,
                    eventSource: 'shopifyAppPixel',
                    eventData: eventData
                });
                return uniqueID;
            };
        }
    }
})(window, 'WorkmagicPixel', localStorage);


