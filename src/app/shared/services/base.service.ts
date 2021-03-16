import { Injectable }              from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfigService }        from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  httpOptions = {
    headers: new HttpHeaders({ "Authorization": "Bearer " + localStorage.getItem("adal.idtoken"), 'Content-Type': 'application/json' })
  };
  httpHeaders = new HttpHeaders({  });

  options: {
    headers?: string,
    observe?: 'body',
    params?: HttpParams,
    reportProgress?: boolean,
    responseType: 'text',
    withCredentials?: boolean
  } = {
      headers: "",
      responseType: 'text' as 'text'
    };

  public get baseUrl() { return this._appConfigService.config.Api };

  constructor(private _appConfigService: AppConfigService) {
  }

  getHttpOptions() {
    this.httpOptions = {
      headers: new HttpHeaders({
        
      })
    };
    return this.httpOptions;
  }

  getHttpOptionForText() {
    return {
      headers: new HttpHeaders({  }),
      responseType: 'text' as 'text'
    };
  }
}
