import { Injectable }        from '@angular/core';
import { environment } from 'src/environments/environment';
import { eControllers } from '@app/shared/enums/eControllers';

type PathParameters = any[] | { [k: string]: Object }

type Controller = {
  [k in keyof typeof eControllers]: Action;
}

type Action = {
  (parameters?: PathParameters): string;

  [k: string]: Action;
}

@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  public endpoint: Controller;

  public static api = new Proxy<Controller>({} as Controller, {
    get(target, key: string) {

      const controller = eControllers[key] || key;
      const emit       = ApiEndpointService.emit([ environment.baseUrl, controller ]);

      return ApiEndpointService.chain(emit);
    }
  });

  private static chain = (antecedent: Action): Action => {
    return new Proxy(antecedent, {
      get(target, action: string, receiver) {
        const emit = ApiEndpointService.emit([ receiver(), action ]);
        return ApiEndpointService.chain(emit);
      }
    });
  };

  private static emit = (path: string | string[]): Action => {
    return <Action>((parameters?: PathParameters) => {
      return ApiEndpointService.createUrl(path, parameters)
    });
  };

  constructor() {
    this.endpoint = new Proxy<Controller>({} as Controller, {
      get(target, key: string) {

        const controller = eControllers[key] || key;
        const endpoint   = terminate([ environment.baseUrl, controller ]);

        return chain(endpoint);
      }
    });

    const chain = (antecedent: Action): Action => {
      return new Proxy(antecedent, {
        get(target, action: string, receiver) {
          const endpoint = terminate([ receiver(), action ]);
          return chain(endpoint);
        }
      });
    };

    const terminate = (path: string | string[]): Action => {
      return <Action>((parameters?: PathParameters) => {
        return ApiEndpointService.createUrl(path, parameters);
      });
    };
  }

  private static createUrl(path: string | string[], parameters?: PathParameters): string {
    if (typeof path !== 'string') {
      path = path.join('/');
    }

    if (parameters == undefined)
      return path;

    if (Array.isArray(parameters)) {
      path = `${ path }/${ parameters.join('/') }`;
    } else if (parameters !== null && typeof parameters === 'object') {
      path = Object.keys(parameters).reduce((qs, key, i, keys) => {
        return `${ qs }${ !i ? '?' : '&' }${ key }=${ encodeURIComponent(parameters[key].toString()) }`
      }, path);
    }
    return path;
  }
}