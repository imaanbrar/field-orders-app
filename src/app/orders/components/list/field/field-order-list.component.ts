import { eOrderStatus } from './../../../../shared/enums/eOrderStatus';
import { Component, OnInit, ViewChild }    from '@angular/core';
import { ActivatedRoute }                  from "@angular/router";
import { statusColor }                     from '@app/orders/shared/orders';
import { ApiEndpointService }              from "@app/shared/services/api-endpoint.service";
import { ScreenService }                   from "@app/shared/services";
import { getValueMapFromLookup, ValueMap } from "@app/shared/utils/getValueMapFromLookup";
import { OrderService }                    from "@orders/services/order.service";
import autobind                            from "autobind-decorator";
import { DxDataGridComponent }             from "devextreme-angular";
import * as AspNetData                     from "devextreme-aspnet-data-nojquery";
import CustomStore                         from "devextreme/data/custom_store";

@Component({
  selector: 'field-order-list',
  templateUrl: './field-order-list.component.html',
  styleUrls: ['./field-order-list.component.scss']
})
export class FieldOrderListComponent implements OnInit {

  @ViewChild("orderGrid") dataGrid: DxDataGridComponent;

  readOnly: boolean = false;
  defaultCompanyId: number;
  defaultProjectId: number;
  defaultStatusId: number = eOrderStatus.eInProgress;

  companies: CustomStore;
  projects: CustomStore;
  statuses: CustomStore;

  public companyMap: ValueMap;
  public projectMap: ValueMap;
  public statusMap: ValueMap;

  public dataSource: CustomStore;

  captions = {
    name: 'Field Order Name',
    number: 'Field Order Number',
  };

  private endpoints: typeof ApiEndpointService;

  constructor(
    private _service: OrderService,
    private route: ActivatedRoute,
    public screen: ScreenService) {

    this.endpoints = ApiEndpointService;

    this.readOnly = false;
  }

  get exportFileName(): string {
    return "Field Orders";
  }

  resolveMap(map: ValueMap, key: string | number): string | number {
    return map[key] || '';
  }

  statusColor(statusId: number): string {
    return statusColor(statusId);
  }

  gridOnInitNewRow(e) {
    e.data.companyId = this.defaultCompanyId;
    e.data.projectId = this.defaultProjectId;
    e.data.statusId  = this.defaultStatusId;
    e.data.isActive  = true;
  }

  gridOnEditorPreparing(e) {
    if (e.parentType === "dataRow" && e.dataField === "projectId") {
      e.editorOptions.disabled = (typeof e.row.data.companyId !== "number");
    }
  }

  gridOnToolbarPreparing(e) {
    e.toolbarOptions.items.unshift({
      location    : 'before',
      locateInMenu: 'auto',
      widget      : 'dxButton',
      options     : {
        text   : 'Clear Filters',
        icon   : 'clear',
        onClick: this.clearFilters
      }
    });

    const addRow = e.toolbarOptions.items.find(item => {
      return item.name === 'addRowButton';
    });

    if (addRow != null) {
      addRow.showText     = this.screen.isMobile.getValue() ? 'always' : 'inMenu';
      addRow.options.text = addRow.options.hint = 'Add Order';
    }

    const exportButton = e.toolbarOptions.items.find(item => {
      return item.name === 'exportButton';
    });

    if (exportButton != null) {
      exportButton.visible = this.screen.isDesktop.getValue();
    }
  }

  gridOnRowInserted(e) {
    this._service.orderId = e.key;
  }

  gridOnRowClick(e) {
    this._service.orderId = e.key;
  }

  rowOnDetailsClicked(row) {
    return () => { this._service.orderId = row.key; };
  }

  @autobind
  columnNumberValidationCallback(e) {
    if (e.value && e.data.projectId) {
      this._service.checkOrderNumber(0, Number(e.data.projectId), e.value)
          .subscribe(data => {
            e.rule.isValid = !data;
            e.rule.message = `${this.captions.number} must be unique with this Project`;
            e.validator.validate();
          });
    }
    return true;
  }

  @autobind
  columnProjectIdValidationCallback(e) {
    if (e.value && e.data.number) {
      this._service.checkOrderNumber(0, Number(e.value), e.data.number)
          .subscribe(data => {
            e.rule.isValid = !data;
            e.rule.message = `${this.captions.number} must be unique with this Project`;
            e.validator.validate();
          });
    }
    return true;
  }

  @autobind
  columnProjectIdDataSource(options) {
    return {
      store : this.projects,
      filter: options.data ? [ "companyId", "=", options.data.companyId ] : null
    };
  }

  columnCompanyIdSetCellValue(this: any, rowData: any, value: any): void {
    rowData.projectId = null;
    this.defaultSetCellValue(rowData, value);
  }

  @autobind
  clearFilters(e) {
    this.dataGrid.instance.clearFilter();
  }

  private createStores() {
    const controller = this._service.orderController;

    this.companies = AspNetData.createStore({
      key     : "value",
      loadUrl : this.endpoints.api.Lookups.GetClientsAsLookup(),
      onLoaded: (loaded: any[]) => {
        this.companyMap = getValueMapFromLookup(loaded, false);
      }
    });

    this.projects = AspNetData.createStore({
      key       : "value",
      loadUrl   : this.endpoints.api.Lookups.GetProjectsAsLookup(),
      onLoaded  : (loaded: any[]) => {
        this.projectMap = getValueMapFromLookup(loaded, false);
      }
    });

    this.statuses = AspNetData.createStore({
      key     : "value",
      loadUrl : this.endpoints.api.Lookups.GetOrderStatusAsLookup(),
      onLoaded: (loaded: any[]) => {
        this.statusMap = getValueMapFromLookup(loaded, false);
      }
    });

    this.dataSource = AspNetData.createStore({
      key       : "id",
      loadUrl   : this.endpoints.api[controller].GetOrderList(),
      insertUrl : this.endpoints.api[controller].PostOrderUsingGrid(),
    });
  }

  ngOnInit() {
    this.createStores();
  }

}
