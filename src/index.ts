// import Pixel from "./pixel";
type FunType = (...args: any[]) => unknown;

// 初始化 TriplePixelData 对象
(window.WorkmagicPixelData = {
    version: '0.0.1',
    platform: 'SHOPIFY',
    isHeadless: true
});

// 主函数
(function (windowObject: Window, identifier: string, localStorage: Storage) {

    // 检查是否已经初始化
    console.log('windowObject[identifier: ', windowObject[identifier + 'cnt']);
    if (!windowObject[identifier + 'cnt']) {
        windowObject[identifier + 'cnt'] = 1;
        
        console.log('!windowObject[identifier]: ', !windowObject[identifier]);
        if (!windowObject[identifier]) {
            windowObject['event_queue'] = [];
            windowObject['installed'] = true;
            // 初始化事件队列
            windowObject[identifier] = function (eventName, eventData = {}) {
                const uniqueID = crypto.randomUUID();
                const utcString = new Date().toISOString();
                console.log('init: ', eventName === 'init');
                if (eventName === 'init') {
                    (windowObject['event_queue'] as any[]) = [];
                    localStorage.setItem(identifier + 'U', JSON.stringify(eventData));
                    // new Pixel(identifier);
                    return;
                }
                (windowObject['event_queue'] as any[]).push({
                    eventId: uniqueID,
                    eventType: eventName,
                    eventTime: utcString,
                    eventSource: 'shopifyAppPixel',
                    eventData: eventData
                });
                return uniqueID;
            };
        }
    }
})(window, 'WorkmagicPixel', localStorage);

// @ts-ignore
WorkmagicPixel('init', '134492')

