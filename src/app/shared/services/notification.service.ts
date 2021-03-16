import { EventEmitter, Injectable }             from '@angular/core';
import autobind                                 from "autobind-decorator";
import DevExpress                               from "devextreme";
import notify                                   from "devextreme/ui/notify";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { take, takeUntil }                      from "rxjs/operators";
import animationConfig = DevExpress.animationConfig;
import positionConfig = DevExpress.positionConfig;
import dxToast = DevExpress.ui.dxToast;
import dxToastOptions = DevExpress.ui.dxToastOptions;
import Notification = NotificationService.Notification;
import NotificationType = NotificationService.NotificationType;
import Notifier = NotificationService.Notifier;
import NotifierAnimationConfig = NotificationService.NotifierAnimationConfig;

export {
  NotificationService
}

@Injectable({
  providedIn: 'root'
})
class NotificationService {

  private defaults: dxToastOptions = {
    elementAttr        : { class: 'notification-service-toast' },
    width              : 'auto',
    height             : 'auto',
    closeOnClick       : true,
    closeOnOutsideClick: false,
    closeOnSwipe       : true,
  };

  private toast: dxToast;

  private queue: Notification[] = [];

  private empty: BehaviorSubject<boolean>;

  private shown: EventEmitter<never> = new EventEmitter<never>();
  private disposed: EventEmitter<never> = new EventEmitter<never>();

  constructor() {
    this.defaults.onInitialized = this.onInitialized;
    this.defaults.onDisposing   = this.onDisposing;
  }

  get empty$(): Observable<boolean> {
    return this.empty.asObservable();
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  get isInitialized(): boolean {
    return this.toast != undefined;
  }

  @autobind
  private onInitialized(e) {
    this.toast = e.component;
    this.toast.repaint();
  }

  @autobind
  private onDisposing() {
    delete this.toast;
    this.disposed.emit();
  }

  @autobind
  private onShown() {
    this.shown.emit();
  }

  @autobind
  private nextShown(): Promise<boolean> {
    return new Promise<boolean>(resolve =>
      this.shown.pipe(take(1)).subscribe(() => resolve(true))
    );
  }

  @autobind
  private notify(): Promise<boolean> {
    if (!this.isInitialized && !this.isEmpty) {
      const { config, type, duration } = this.queue.shift();

      notify(config, type, duration);

      // console.log({notify: config.message, config});
      return this.nextShown();
    }
    return Promise.resolve(false);
  }

  @autobind
  showNext(): Promise<boolean> {
    if (!this.isEmpty) {
      if (this.isInitialized) {
        this.toast.hide();
        return this.disposed.pipe(take(1)).toPromise().then(this.nextShown);
      } else {
        return this.notify();
      }
    } else {
      this.empty.next(true);
      this.empty.complete();

      return Promise.resolve(false);
    }
  }

  clear(): Promise<boolean> {
    if (this.isInitialized) {
      this.queue = [];
      this.toast.hide();
      return this.disposed.pipe(take(1)).toPromise();
    }
    return Promise.resolve(false);
  }

  @autobind
  fastForward(): Promise<boolean> {
    if (!this.isEmpty) {
      let done = new Subject<boolean>();

      const close = () => {
        done.next(true);
        done.complete();
      };

      this.shown
          .pipe(takeUntil(done))
          .subscribe(() => {
            this.showNext().then(shown => {
              if (!shown) {
                close();
              }
            });
          });

      return this.showNext().then(shown => {
        if (!shown) {
          close();
        }
        return done.toPromise()
      });
    }
    return Promise.resolve(true);
  }

  skipToLast(): Promise<boolean> {
    const length = this.queue.length;

    if (length > 0) {
      this.queue = this.queue.slice(length - 1, length);
      return this.showNext();
    }

    return Promise.resolve(false);
  }

  getNotifier(options: dxToastOptions, toggle?: Observable<boolean>): Notifier {
    const _options = options;

    let enabled = true;
    if (toggle != undefined) {
      toggle.subscribe(state => {
        enabled = state;
      });
    }

    return (
      message: string | dxToastOptions | (string | dxToastOptions)[],
      type: NotificationType = 'info',
      duration: number = 2000
    ) => {
      if (!enabled) {
        return Promise.resolve(false);
      }

      let messages: dxToastOptions[];

      if (typeof message === 'string') {
        messages = [ { message } ];
      } else if (Array.isArray(message)) {
        messages = message.map(message => {
          if (typeof message === 'string') {
            return { message };
          } else {
            return message;
          }
        });
      } else {
        messages = [ message ];
      }

      const notifications: Notification[] = messages.map(message => {
        const config: dxToastOptions = Object.assign({}, this.defaults, _options, message, {
          onHidden: this.showNext,
          onShown : this.onShown
        });
        return { config, type, duration };
      });

      this.queue.push(...notifications);

      if (!this.isEmpty && (this.empty == undefined || this.empty.closed)) {
        this.empty = new BehaviorSubject<boolean>(false);
      }

      return this.notify();
    }
  }

  static Animation = class {

    static slide(
      from: Partial<positionConfig>,
      to: Partial<positionConfig>,
      boundary: string | Element | JQuery | Window = window,
      of: string | Element | JQuery | Window       = window
    ): NotifierAnimationConfig {

      const { my: fromMy, at: fromAt } = from;
      const { my: toMy, at: toAt }     = to;

      return {
        hide: {
          duration: 200,
          type    : 'slide',
          from    : {
            opacity : 1,
            position: { my: toMy, at: toAt, of: of, boundary: boundary, collision: { x: 'fit', y: 'fit' } }
          },
          to      : {
            opacity : 0,
            position: { my: fromMy, at: fromAt, of: of, boundary: boundary, collision: { x: 'none', y: 'fit' } }
          }
        },
        show: {
          duration: 200,
          type    : 'slide',
          from    : {
            opacity : 0,
            position: { my: fromMy, at: fromAt, of: of, boundary: boundary, collision: { x: 'none', y: 'fit' } }
          },
          to      : {
            opacity : 1,
            position: { my: toMy, at: toAt, of: of, boundary: boundary, collision: { x: 'fit', y: 'fit' } }
          }
        }
      }
    }

    static fade: NotifierAnimationConfig = {
      hide: {
        duration: 200,
        type    : 'fadeOut'
      },
      show: {
        duration: 200,
        type    : 'fadeIn'
      }
    }
  }
}

declare namespace NotificationService {

  interface NotifierAnimationConfig {
    hide?: animationConfig;
    show?: animationConfig;
  }

  type NotificationType = 'custom' | 'error' | 'info' | 'success' | 'warning';

  type Notification = {
    config: dxToastOptions;
    type: NotificationType;
    duration: number;
  }

  type Notifier = (messages: string | dxToastOptions | (string | dxToastOptions)[], type?: NotificationType, duration?: number) => Promise<boolean>;
}
