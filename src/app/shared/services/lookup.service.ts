import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { eDropdownLookup } from '../enums/eDropdownLookup';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private commoditiesUrl = environment.baseUrl + "/Commodities";
  private prequalsUrl = environment.baseUrl + "/PrequalClassifications";
  private vdrCodesUrl = environment.baseUrl + "/VDRCodes";
  private companyCommentsTypeUrl = environment.baseUrl + "/CompanyCommentTypes";
  private projectStatusUrl = environment.baseUrl + "/ProjectStatus";
  private vendorRatingTypesUrl = environment.baseUrl + "/VendorRatingTypes";
  private projectDeliveryTypeUrl = environment.baseUrl + "/ProjectDeliveryTypes";
  private citiesUrl = environment.baseUrl + "/Cities";
  private statesUrl = environment.baseUrl + "/States";
  private countriesUrl = environment.baseUrl + "/Countries";

  private lookupDropdowns = [
    {
      id: eDropdownLookup.eCompanyCommentType,
      text: 'Company Comment Type',
      maxLength: 50,
      url: this.companyCommentsTypeUrl,
      dataSource: AspNetData.createStore({
        key: "id",
        loadUrl: this.companyCommentsTypeUrl + "/GetCompanyCommentType",
        insertUrl: this.companyCommentsTypeUrl + "/PostCompanyCommentType",
        updateUrl: this.companyCommentsTypeUrl + "/PutCompanyCommentType",
        deleteUrl: this.companyCommentsTypeUrl + '/DeleteCompanyCommentTypePretend',
        onBeforeSend: function (method, ajaxOptions) {
          ajaxOptions.headers = { "Authorization": "Bearer " + localStorage.getItem("adal.idtoken") };
           
        }
      })
    },
    {
      id: eDropdownLookup.eProjectStatus,
      text: 'Project Status',
      maxLength: 20,
      url: this.projectStatusUrl,
      dataSource: AspNetData.createStore({
        key: "id",
        loadUrl: this.projectStatusUrl + "/GetProjectStatus",
        insertUrl: this.projectStatusUrl + "/PostProjectStatus",
        updateUrl: this.projectStatusUrl + "/PutProjectStatus",
        deleteUrl: this.projectStatusUrl + '/DeleteProjectStatusPretend',
        onBeforeSend: function (method, ajaxOptions) {
          ajaxOptions.headers = { "Authorization": "Bearer " + localStorage.getItem("adal.idtoken") };
           
        }
      })
    },
    {
      id: eDropdownLookup.eVendorRatingType,
      text: 'Vendor Rating Type',
      maxLength: 200,
      url: this.vendorRatingTypesUrl,
      dataSource: AspNetData.createStore({
        key: "id",
        loadUrl: this.vendorRatingTypesUrl + "/GetVendorRatingType",
        insertUrl: this.vendorRatingTypesUrl + "/PostVendorRatingType",
        updateUrl: this.vendorRatingTypesUrl + "/PutVendorRatingType",
        deleteUrl: this.vendorRatingTypesUrl + '/DeleteVendorRatingTypePretend',
        onBeforeSend: function (method, ajaxOptions) {
          ajaxOptions.headers = { "Authorization": "Bearer " + localStorage.getItem("adal.idtoken") };
           
        }
      })
    },
    {
      id: eDropdownLookup.eProjectDeliveryType,
      text: 'Project Delivery Type',
      maxLength: 50,
      url: this.projectDeliveryTypeUrl,
      dataSource: AspNetData.createStore({
        key: "id",
        loadUrl: this.projectDeliveryTypeUrl + "/GetProjectDeliveryType",
        insertUrl: this.projectDeliveryTypeUrl + "/PostProjectDeliveryType",
        updateUrl: this.projectDeliveryTypeUrl + "/PutProjectDeliveryType",
        deleteUrl: this.projectDeliveryTypeUrl + '/DeleteProjectDeliveryTypePretend',
        onBeforeSend: function (method, ajaxOptions) {
          ajaxOptions.headers = { "Authorization": "Bearer " + localStorage.getItem("adal.idtoken") };

        }
      })
    }
  ];

  getCommoditiesUrl(): string {
    return this.commoditiesUrl;
  }

  getPrequalsUrl(): string {
    return this.prequalsUrl;
  }

  getVdrCodesUrl(): string {
    return this.vdrCodesUrl;
  }

  getCitiesUrl(): string {
    return this.citiesUrl;
  }

  getStatesUrl(): string {
    return this.statesUrl;
  }

  getCountriesUrl(): string {
    return this.countriesUrl;
  }

  getLookupDropdowns(): any[] {
    return this.lookupDropdowns;
  }

  checkDelete(id: number, url: string): Observable<boolean> {
    return this.http.get<boolean>(`${url}/CheckDelete?id=${id}`, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  constructor(private http: HttpClient, private baseService: BaseService) { }
}
