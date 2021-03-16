import { BreakpointObserver, Breakpoints }             from '@angular/cdk/layout';
import { EventEmitter, Injectable, Output, Renderer2 } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable }  from "rxjs";
import { debounceTime, distinctUntilChanged, map, takeUntil } from "rxjs/operators";

type Sizes = 'XSmall' | 'Small' | 'Medium' | 'Large' | 'XLarge';

const sizes: Array<Sizes> = [ 'XSmall', 'Small', 'Medium', 'Large', 'XLarge' ];

@Injectable()
export class ScreenService {
  @Output() changed   = new EventEmitter();
  @Output() hasFooter = new EventEmitter<boolean>();

  readonly onBeforeMobileSwitched = new EventEmitter<boolean>();
  readonly onAfterMobileSwitched = new EventEmitter<boolean>();

  readonly XSmall: BehaviorSubject<boolean>
  readonly Small: BehaviorSubject<boolean>;
  readonly Medium: BehaviorSubject<boolean>;
  readonly Large: BehaviorSubject<boolean>;
  readonly XLarge: BehaviorSubject<boolean>;

  readonly isMobile: BehaviorSubject<boolean>;
  readonly isDesktop: BehaviorSubject<boolean>;
  readonly isLarge: BehaviorSubject<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.XSmall = new BehaviorSubject<boolean>(this.breakpointObserver.isMatched(Breakpoints.XSmall));
    this.Small  = new BehaviorSubject<boolean>(this.breakpointObserver.isMatched(Breakpoints.Small));
    this.Medium = new BehaviorSubject<boolean>(this.breakpointObserver.isMatched(Breakpoints.Medium));
    this.Large  = new BehaviorSubject<boolean>(this.breakpointObserver.isMatched(Breakpoints.Large));
    this.XLarge = new BehaviorSubject<boolean>(this.breakpointObserver.isMatched(Breakpoints.XLarge));

    this.breakpointObserver
        .observe([ Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge ])
        .subscribe(state => {
          sizes.forEach(size => {
            const currentState = state.breakpoints[Breakpoints[size]];
            if (this[size].getValue() !== currentState) {
              // console.log(`${ size }: ${ this[size].getValue() } --> ${ currentState }`);
              this[size].next(currentState);
            }
          })
          this.changed.next()
        });

    let XSmall = this.XSmall.getValue();
    let Small  = this.Small.getValue();
    let Medium = this.Medium.getValue();
    let Large  = this.Large.getValue();
    let XLarge = this.XLarge.getValue();

    let Mobile  = Small || XSmall || !(Medium || Large || XLarge);
    let Desktop = !Mobile;

    this.isMobile  = new BehaviorSubject<boolean>(Mobile);
    this.isDesktop = new BehaviorSubject<boolean>(Desktop);
    this.isLarge   = new BehaviorSubject<boolean>(Large || XLarge || !(XSmall || Small || Medium));

    combineLatest([ this.XSmall, this.Small, this.Medium, this.Large, this.XLarge ])
      .pipe(
        map(([ XSmall, Small, Medium, Large, XLarge ]) => (Small || XSmall) || !(Medium || Large || XLarge)),
        debounceTime(50),
        distinctUntilChanged())
      .subscribe(isMobile => {
        if (this.isMobile.getValue() !== isMobile) {
          this.onBeforeMobileSwitched.emit(isMobile);
          this.isMobile.next(isMobile);
          this.isDesktop.next(!isMobile);
          this.onAfterMobileSwitched.emit(isMobile);
        }
      });

    combineLatest([ this.Large, this.XLarge ])
      .pipe(
        map(([ Large, XLarge ]) => Large || XLarge),
        debounceTime(50),
        distinctUntilChanged())
      .subscribe(isLarge => {
        if (this.isLarge.getValue() !== isLarge) {
          this.isLarge.next(isLarge);
        }
      });
  }

  private isLargeScreen() {
    const isLarge  = this.breakpointObserver.isMatched(Breakpoints.Large);
    const isXLarge = this.breakpointObserver.isMatched(Breakpoints.XLarge);

    return isLarge || isXLarge;
  }

  public get sizes() {
    return {
      'screen-x-small': this.breakpointObserver.isMatched(Breakpoints.XSmall),
      'screen-small'  : this.breakpointObserver.isMatched(Breakpoints.Small),
      'screen-medium' : this.breakpointObserver.isMatched(Breakpoints.Medium),
      'screen-large'  : this.isLargeScreen(),
      // 'screen-mobile' : this.isMobile.getValue(),
      // 'screen-desktop': this.isDesktop.getValue(),
    };
  }

  public screenByWidth(width: number) {
    if (width <= 600) {
      return 'xs';
    } else if (width <= 960) {
      return 'xs';
    } else if (width <= 1280) {
      return 'sm';
    } else if (width <= 1920) {
      return 'md';
    } else {
      return 'lg';
    }
  }

  showFooter() {
    this.hasFooter.emit(true);
  }

  hideFooter() {
    this.hasFooter.emit(false);
  }

  hideFooterOnMobile(until: Observable<any>) {
    this.isMobile
        .pipe(takeUntil(until))
        .subscribe({
          next    : isMobile => isMobile ? this.hideFooter() : this.showFooter(),
          complete: () => this.showFooter()
        });
  }

  hideFooterOnDesktop(until: Observable<any>) {
    this.isDesktop
        .pipe(takeUntil(until))
        .subscribe({
          next    : isDesktop => isDesktop ? this.hideFooter() : this.showFooter(),
          complete: () => this.showFooter()
        });
  }
}
