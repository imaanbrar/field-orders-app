import { Injectable }                                       from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from "@angular/router";
import { Observable }                                       from "rxjs";
import { tap }                                              from "rxjs/operators";

interface IOutlets {
  outlets: {
    [k: string]: any[];
  }
}

interface ICommands {
  primary: any[],
  outlets: IOutlets
}

@Injectable({
  providedIn: 'root'
})
export class RouteInfoService {

  private _primary: any[];
  private _outlets: IOutlets;

  constructor(private router: Router) {
    this.reset();
  }

  get primary(): any[] {
    return this._primary;
  }

  get outlets(): IOutlets {
    return this._outlets;
  }

  public watchRouteParams(activatedRoute: ActivatedRoute): Observable<Params> {
    return activatedRoute.params.pipe(
      tap(() => this.extractCommandsFromRoute(activatedRoute))
    );
  }

  private extractCommandsFromRoute(activatedRoute: ActivatedRoute): void  {
    this._primary = [];
    this._outlets = this._outlets || {
      outlets: {}
    };
    activatedRoute.pathFromRoot.forEach(route => {
      const isOutlet = route.outlet !== 'primary';
      const outlet   = [];
      route.snapshot.url.forEach(segment => {
        isOutlet ? outlet.push(segment.path) : this._primary.push(segment.path);
      });
      if (isOutlet) {
        this._outlets.outlets[route.outlet] = outlet;
      }
    });
  }

  public reset(): void {
    this._primary = [];
    this._outlets = {
      outlets: {}
    };
  }

  public cloneCommands(): ICommands {
    let primary = this.primary.slice(0);
    let outlets = {
      outlets: {}
    };
    Object.keys(this.outlets.outlets).forEach(key => {
      outlets.outlets[key] = this.outlets.outlets[key].slice(0);
    });

    return {primary, outlets};
  }

  public createNavigateCommands(primary: any[], outlets?: IOutlets): any[] {
    const commands = primary.slice(0);
    if (outlets != null && Object.keys(outlets.outlets).length > 0) {
      commands.push(outlets);
    }
    return commands;
  }

  get navigateCommands(): any[] {
    return this.createNavigateCommands(this.primary, this.outlets);
  }

  public navigate(route: ActivatedRoute, commands: any[], extras?: NavigationExtras): Promise<boolean> {
    if (route == null || route.outlet === 'primary') {
      return this.router.navigate(this.createNavigateCommands(commands, this.outlets), extras)
                 .then(failed => {
                   if (failed) {
                     return this.router.navigate(commands, extras);
                   }
                   return failed;
                 })
                 .catch((e => {
                   return this.router.navigate(commands, extras);
                 }));
    } else {
      let {primary, outlets} = this.cloneCommands();

      outlets.outlets[route.outlet] = commands;

      return this.router.navigate(this.createNavigateCommands(primary, outlets), extras)
                 .then(failed => {
                   if (failed) {
                     return this.router.navigate(commands, extras);
                   }
                   return failed;
                 })
                 .catch((e => {
                   return this.router.navigate(commands, extras);
                 }));
    }

  }
}
