import { HttpClient, HttpErrorResponse }                                  from "@angular/common/http";
import { Injectable }                                                     from '@angular/core';
import { ActivatedRoute, Router }                                         from "@angular/router";
import { eControllers }                                                   from "@app/shared/enums/eControllers";
import { ApiEndpointService }                                             from "@app/shared/services/api-endpoint.service";
import { BaseService }                                                    from "@app/shared/services/base.service";
import { RouteInfoService }                                               from "@app/shared/services/route-info.service";
import { UserService }                                                    from "@app/shared/services/user.service";
import { OrderParameters }                                                from "@orders/models/order-parameters";
import { isRecentOrder, RecentOrder }                                     from "@orders/models/recent-order";
import { defaultType, isOrderType, orderControllers, Orders, orderTypes } from "@orders/shared/orders";
import autobind                                                           from "autobind-decorator";
import { BehaviorSubject, Observable, throwError }                        from "rxjs";
import { catchError, finalize, map }                                      from "rxjs/operators";
import OrderType = Orders.OrderType;

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderParameters: OrderParameters = new OrderParameters();

  private _orderParameters$: BehaviorSubject<OrderParameters>;

  private activatedRoute: ActivatedRoute;

  endpoints: typeof ApiEndpointService;

  constructor(
    private http: HttpClient,
    private routeInfo: RouteInfoService) {

    this.endpoints = ApiEndpointService;
  }

  get defaultType(): OrderType {
    return defaultType;
  }

  get orderType(): OrderType {
    return this.orderParameters.orderType;
  }

  set orderType(type: OrderType) {
    type = isOrderType(type) ? type : this.defaultType;
    this.routeInfo.navigate(this.activatedRoute, [ 'orders', 'list', type ]);
  }

  get orderId(): number {
    return this.orderParameters.orderId;
  }

  set orderId(id: number) {
    if ((typeof id === 'number' || typeof (id = Number(id)) === 'number') && id !== this.orderId) {
      this.routeInfo.navigate(this.activatedRoute, [ 'orders', 'details', this.orderType, id ]);
    }
  }

  set order(params: OrderParameters | RecentOrder) {
    let { type, id } = isRecentOrder(params)
                       ? { type: orderTypes[params.orderType], id: params.orderId }
                       : { type: params.orderType, id: params.orderId };

    // console.log(this.activatedRoute, ['orders', type, id], params);

    this.routeInfo.navigate(this.activatedRoute, [ 'orders', 'details', type, id ]);
  }

  get orderController(): eControllers.Key {
    return orderControllers[this.orderType];
  }

  get orderParameters$(): Observable<OrderParameters> {
    return this._orderParameters$.asObservable();
  }

  watchRouteParams(route: ActivatedRoute): Observable<OrderParameters> {
    if (this._orderParameters$ != null) {
      return this._orderParameters$;
    }

    this.activatedRoute = route;

    this._orderParameters$ = new BehaviorSubject(this.orderParameters);

    return this.routeInfo.watchRouteParams(route).pipe(
      map(params => {
        this.orderParameters = new OrderParameters(params);

        this._orderParameters$.next(this.orderParameters);

        return this.orderParameters;
      }),
      catchError((err, caught) => {
        this.routeInfo.navigate(route, [ 'orders', 'list', defaultType ]);
        return caught;
      }),
      finalize(() => {
        this._orderParameters$.complete();
        this.routeInfo.reset();

        delete this._orderParameters$;
        delete this.activatedRoute;

        this.orderParameters = new OrderParameters();
      })
    );
  }

  openOrderDetails(id: number): Promise<boolean> {
    if ((typeof id === 'number' || typeof (id = Number(id)) === 'number') && id !== this.orderId) {
      return this.routeInfo.navigate(this.activatedRoute, [ 'orders', 'details', this.orderType, id ]);
    } else {
      return Promise.resolve(false);
    }
  }

  openOrderList(type?: OrderType) {
    this.orderType = type || this.orderType || this.defaultType;
  }

  checkOrderNumber(id: number, projectId: number, number: string): Observable<boolean> {
    const controller = this.endpoints.api[this.orderController];
    return this.http.get<boolean>(controller.CheckOrderNumber({ id, projectId, number })).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  updateRecentOrder(orderId: number): Observable<any> {
    return this.http.post<any>(this.endpoints.api.RecentOrders.UpdateRecentOrderList(), orderId).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  getOrderById(id: number): Observable<any> {
    const controller = this.endpoints.api[this.orderController];
    return this.http.get<any>(controller.GetOrderById({ id })).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  getOrderSummaryById(id: number): Observable<any> {
    const controller = this.endpoints.api[this.orderController];
    return this.http.get<any>(controller.GetOrderSummaryById({ id })).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  @autobind
  checkAccessToOrder(projectId: number): Observable<boolean> {
    const controller = this.endpoints.api[this.orderController || 'Projects'];
    return this.http.get<boolean>(controller.CheckAccessToOrders({ projectId })).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  updateOrder(id: number, order: any): Observable<any> {
    const controller = this.endpoints.api[this.orderController];
    return this.http.put<boolean>(controller.PutOrder({ id }), order).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }

  checkDelete(id: number, controller: eControllers.Key): Observable<boolean> {
    return this.http.get<boolean>(this.endpoints.api[controller].CheckDelete({ id })).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error.message);
      })
    );
  }
}
