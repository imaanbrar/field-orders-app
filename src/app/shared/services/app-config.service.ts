import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpBackend } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private http: HttpClient;

  public config: IConfig;
  constructor(@Inject('BASE_URL') private baseUrl: string, handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  loadConfig() {
    const request = () => {
      let response = this.http.get<IConfig>(this.baseUrl + 'api/Configuration/getConfiguration').toPromise();

      this.x(response);
      

    }

    return request();
  }

  private x(y) {
    this.config = <IConfig>(y);
    this.config.TenantId = '413c6f2c-219a-4692-97d3-f2b4d80281e7';
    this.config.BaseUrl = this.baseUrl;
    this.config.ClientId = "fd987739-0646-4014-9e33-7a2e847749b3";
    switch (this.config.Env) {
      case "local":
        this.config.ClientId = "fd987739-0646-4014-9e33-7a2e847749b3";
        break;
      case "development":
        this.config.ClientId = "fd987739-0646-4014-9e33-7a2e847749b3";
        break;
      case "uat":
        this.config.ClientId = "fd987739-0646-4014-9e33-7a2e847749b3";
        break;
      default:
    }
  }
}

export interface IConfig {
  Env: string;
  ClientId: string;
  TenantId: string;
  BaseUrl: string;
  Api: string;
}
