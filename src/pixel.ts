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

class Pixel {
  private identifier = '_wm_pixel';
  private timer: Number | null = null;

  constructor(identifier: string) {
    this.identifier = identifier;
    monitorWindowArrayChanges('event_queue', (newLength) => {
      if (!!newLength && !this.timer) {
        this.startTimer();
      }
    });
  }
  public push(ev: Event[] | Event) {
    const events = Array.isArray(ev) ? ev : [ev];
    (window.event_queue as Event[]).push(...events);
  }

  private send() {
    const list = (window.event_queue as Event[]).splice(0, 10);
    const tenantId = localStorage.getItem(this.identifier + 'U') || '';
    return fetch(`https://track-api.workmagic.io/api/track/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list.map(item => ({ ...item, tenantId }))),
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
