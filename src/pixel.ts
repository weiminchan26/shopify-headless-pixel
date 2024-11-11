type Event = {
  eventId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
};

function monitorWindowArrayChanges<T>(arrayName: string, callback: (newLength: number) => void): void {
  const originalArray: T[] = (window as any)[arrayName];

  if (!Array.isArray(originalArray)) {
    throw new Error(`${arrayName} is not an array`);
  }

  // 创建 Proxy 来监控数组的变化
  (window as any)[arrayName] = new Proxy(originalArray, {
    set(target: T[], prop: string | symbol, value: any, receiver: any): boolean {
      const result = Reflect.set(target, prop, value, receiver);  // 修正: 明确传递 set 方法所需的参数

      // 如果是修改长度时，触发回调
      if (prop === 'length') {
        callback(target.length);
      }

      return result;
    }
  });
}

function pickFields(obj: Record<string, any>, fields: string[]) {
  return fields.reduce((result, field) => {
    if (!!obj[field]) {
      result[field] = obj[field];
    }
    return result;
  }, {} as Record<string, any>);
}

class Pixel {
  private timer: Number | null = null;
  private traceIds: Record<string, string>;
  private clientId: string;
  private navigatorFields = [
    'language',
    'cookieEnabled',
    'languages',
    'userAgent',

  ];
  private windowFields = [
    'innerHeight',
    'innerWidth',
    'outerHeight',
    'outerWidth',
    'pageXOffset',
    'pageYOffset',
    'location',
    'origin',
    'screen',
    'screenX',
    'screenY',
    'scrollX',
    'scrollY',
  ];
  private documentFields = [
    'location',
    'referrer',
    'characterSet',
    'title',
  ];

  constructor() {
    monitorWindowArrayChanges('event_queue', (newLength) => {
      if (!!newLength && !this.timer) {
        this.startTimer();
      }
    });
    const traceKeys = ['_shopify_y', '_ga', '_gid', '_fbp', '_fbc', 'wm_client_sid', 'ttclid', '_ttp', '_pangle'];

    // 将 cookie 字符串解析为对象格式
    const getCookies = () => {
      return document.cookie.split("; ").reduce((cookies, cookieStr) => {
        const [name, value] = cookieStr.split("=");
        cookies[name] = decodeURIComponent(value);
        return cookies;
      }, {} as Record<string, string>);
    };

    // 使用该函数获取所有 cookies 作为对象
    const allCookies = getCookies();
    this.traceIds = traceKeys.reduce(
        (ret, item) => {
          ret[item] = allCookies[item] ?? '';
          return ret;
        },
        {} as Record<string, string>,
    );
    this.clientId = allCookies['_shopify_y'] ?? '';
  }
  public push(ev: Event[] | Event) {
    const events = Array.isArray(ev) ? ev : [ev];
    (window.event_queue as Event[]).push(...events);
  }

  private async send() {
    const list = (window.event_queue as Event[]).splice(0, 10).map((item) => {
      item['eventData']['client_id'] = this.clientId;
      item['eventData']['traceIds'] = this.traceIds;
      item['eventData']['context'] = {
        navigator: pickFields(navigator, this.navigatorFields),
        window: pickFields(window, this.windowFields),
        document: pickFields(document, this.documentFields),
        event_from: 'custom_pixel'
      };
      return item;
    });

    return fetch(`https://track-api.workmagic.io/api/track/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list.map(item => ({
        ...item,
        tenantId: window.WorkmagicPixelData.tenantId,
        tenantIdSign: window.WorkmagicPixelData.tenantIdSign
      }))),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) {
          this.push(list);
        }
      })
      .catch(() => {
        this.push(list);
      });
  }

  private startTimer() {
    this.timer = setTimeout(() => {
      this.timer = null;
      this.send();
    }, 2000);
  }
}

export default Pixel;
