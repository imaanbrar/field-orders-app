import { formatCurrency } from "@angular/common";
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoggedInUser } from "@app/shared/models/LoggedInUser";
import { ApiEndpointService } from "@app/shared/services/api-endpoint.service";
import { EditorStateService } from "@app/shared/services/editor-state.service";
import { NotificationService } from "@app/shared/services/notification.service";
import { UserService } from "@app/shared/services/user.service";
import { ScreenService } from "@app/shared/services";
import { getValueMapFromLookup } from "@app/shared/utils/getValueMapFromLookup";
import { swapGridCells } from "@app/shared/utils/swapGridCells";
import { FieldItem } from "@orders/models/field/field-item";
import { FieldOrder } from "@orders/models/field/field-order";
import { OrderService } from "@orders/services/order.service";
import autobind from "autobind-decorator";
import { DxDataGridComponent, DxPopupComponent } from "devextreme-angular";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import CustomStore from "devextreme/data/custom_store";
import { alert } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { OnChange } from "property-watch-decorator";
import { Subject } from "rxjs";
import { map, retry, takeUntil } from "rxjs/operators";
import IFieldItem = FieldItem.IFieldItem;
import Notifier = NotificationService.Notifier;

@Component({
  selector: 'field-order-details-sos',
  templateUrl: './field-order-details-sos.component.html',
  styleUrls: ['./field-order-details-sos.component.scss']
})
export class FieldOrderDetailsSosComponent implements OnInit, OnDestroy {

  @OnChange('onGridSet')
  @ViewChild("dataGrid") dataGrid: DxDataGridComponent;

  @OnChange('onOrderSet')
  @Input() order: FieldOrder;

  orderId: number;

  dataSource: CustomStore;
  wbs: CustomStore;

  importModel = FieldItem;

  popups = {
    excelImportVisible: false
  };
  @ViewChild("excelImportPopup") excelImportPopup: DxPopupComponent;

  loggedInUser: LoggedInUser;

  private endpoints: typeof ApiEndpointService;

  units = FieldItem.units;

  subtotalLimit = 5000;

  private notify: Notifier;

  private destroyed: Subject<void> = new Subject();

  private saving = false;

  constructor(
    private _service: OrderService,
    private editorState: EditorStateService,
    public screen: ScreenService,
    private notification: NotificationService) {

    this.endpoints = ApiEndpointService;
    this.loggedInUser = UserService.loggedInUser;

    this.notify = notification.getNotifier({
      position: {
        my: 'right top',
        at: 'right top',
        of: window,
        boundary: '#buttonBar',
        collision: { x: 'fit', y: 'fit' }
      },
      animation: NotificationService.Animation.slide(
        { my: 'left top', at: 'right top' },
        { my: 'right top', at: 'right top' },
        '#buttonBar'
      )
    },
      screen.isMobile.pipe(takeUntil(this.destroyed))
    );
  }

  get readOnly(): boolean {
    return false;
  }

  get exportFileName(): string {
    return `[${this.order.number}] ${this.order.name} - Items`;
  }

  get totalPriceSummaryFunction(): () => number {
    let func = () => 0;

    if (this.dataGrid && this.dataGrid.instance) {
      const summary = this.dataGrid.instance.getTotalSummaryValue;

      // sometimes there is a grid instance but this isn't a function??
      if (typeof summary === 'function') {
        func = () => summary('extendedPrice');
      }
    }

    return func;
  }

  get totalGst(): number {
    const gst = Number(this.order.gst) || 0;
    const total = this.totalPriceSummaryFunction();

    return total * gst;
  }

  get totalPst(): number {
    const pst = Number(this.order.pst) || 0;
    const total = this.totalPriceSummaryFunction();

    return total * pst;
  }

  get totalHst(): number {
    const hst = Number(this.order.hst) || 0;
    const total = this.totalPriceSummaryFunction();

    return total * hst;
  }

  get totalTax(): number {
    return this.totalGst + this.totalPst + this.totalHst;
  }

  get totalValueAfterTax(): number {
    return this.totalPriceSummaryFunction() + this.totalTax;
  }

  onRowPrepared(e) {
    if (e.rowType == 'data') {
      if (e.data.isDeleted == true)
        e.rowElement.classList.add('row-is-deleted');
    }
  }

  onRowClick(e) {
    if (e.rowType === 'data') {
      e.component.focusedRowKey = e.key;
    }
  }

  newRowEvent(e) {
    e.data.orderId = this.order.id;
    e.data.rev = this.order.revisionNumber;
    e.data.uom = 'EA';

    e.data.itemNumber = e.component.totalCount() + e.component.getController("editing").getInsertedData().length + 1;
  }

  onRowInserted(e: any) {
    e.component.navigateToRow(e.key);
    this.onSaved(e);
  }

  onRowUpdating(e) {
    if (e.oldData.rev != this.order.revisionNumber) {
      e.newData.rev = this.order.revisionNumber;
    }

    this.onSaving(e);
  }

  removingRowEvent(e) {
    e.cancel = this._service.checkDelete(e.data.id, 'OrderItems').pipe(
      map(proceed => {
        const cancel = !proceed;
        if (cancel) {
          notify("Error! There is an associated item with this item", "error", 7000);
        } else {
          this.onSaving(e);
        }
        return cancel;
      })
    ).toPromise();
  }

  onToolbarPreparing(e) {
    const isXSmall = this.screen.XSmall.getValue();
    const isMobile = this.screen.isMobile.getValue();
    const isDesktop = !isMobile;

    e.toolbarOptions.items.unshift({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: isDesktop ? 'auto' : 'always',
      options: {
        text: 'Reset Item Numbers',
        disabled: this.readOnly,
        hint: 'Reset Item Numbers based on current item ordering',
        onClick: this.setItemNumbers
      }
    });
    e.toolbarOptions.items.unshift({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: isXSmall ? 'always' : 'auto',
      showText: isMobile ? 'always' : 'inMenu',
      options: {
        icon: 'arrowdown',
        disabled: this.readOnly,
        hint: 'Move Down',
        text: 'Move Down',
        onClick: this.moveDown
      }
    });
    e.toolbarOptions.items.unshift({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: isXSmall ? 'always' : 'auto',
      showText: isMobile ? 'always' : 'inMenu',
      options: {
        icon: 'arrowup',
        disabled: this.readOnly,
        hint: 'Move Up',
        text: 'Move Up',
        onClick: this.moveUp
      }
    });
    e.toolbarOptions.items.unshift({
      location: 'before',
      locateInMenu: isDesktop ? 'auto' : 'always',
      disabled: this.readOnly,
      widget: 'dxButton',
      options: {
        text: 'Import From Excel',
        onClick: this.showImport
      }
    });

    const addRow = e.toolbarOptions.items.find(item => {
      return item.name === 'addRowButton';
    });

    if (addRow != null) {
      addRow.locateInMenu = 'never';
      addRow.showText = isMobile ? 'always' : 'inMenu';
      addRow.options.text = addRow.options.hint = 'Add Item';
    }

    const exportButton = e.toolbarOptions.items.find(item => {
      return item.name === 'exportButton';
    });

    if (exportButton != null) {
      exportButton.locateInMenu = isDesktop ? 'auto' : 'always';
    }
  }

  @autobind
  setItemNumbers() {
    const count = this.dataGrid.instance.totalCount();
    for (let i = 0; i < count; i++) {
      this.dataGrid.instance.cellValue(i, 'itemNumber', i + 1);
    }
  }

  @autobind
  moveUp(e) {
    const grid = this.dataGrid.instance;
    const index = grid.getRowIndexByKey(this.dataGrid.focusedRowKey);

    if (index > 0) {
      if (swapGridCells(grid, index, index - 1, 'itemNumber')) {
        grid.saveEditData().then(() => {
          if (grid.hasEditData()) {
            swapGridCells(grid, index, index - 1, 'itemNumber');
          }
        });
      }
    }
  }

  @autobind
  moveDown(e) {
    const grid = this.dataGrid.instance;
    const index = grid.getRowIndexByKey(this.dataGrid.focusedRowKey);
    const last = grid.getVisibleRows().length - 1;

    if (index < last) {
      if (swapGridCells(grid, index, index + 1, 'itemNumber')) {
        grid.saveEditData().then(() => {
          if (grid.hasEditData()) {
            swapGridCells(grid, index, index + 1, 'itemNumber');
          }
        });
      }
    }
  }

  @autobind
  showImport() {
    this.popups.excelImportVisible = true;
    this.excelImportPopup.visible = true;
  }

  @autobind
  importDataAdded() {
    this.popups.excelImportVisible = false;
    this.excelImportPopup.visible = false;
  }

  @autobind
  isDirty(): boolean {
    if (this.dataGrid && this.dataGrid.instance)
      return true;
    else
      return false;
  }

  setDirty(): void {
    this.editorState.setDirty({ component: 'Items', fields: this.isDirty });
  }

  onOrderSet(order) {
    if (order && order.id) {
      this.createStores();
    }
  }

  onGridSet(grid: DxDataGridComponent) {
    if (grid != undefined) {
      this.setDirty();
    }
  }

  calculateExtendedPrice(row: IFieldItem) {
    return row.isDeleted ? '-' : row.unitPrice >= 0 && row.quantity >= 0 ? row.unitPrice * row.quantity : 0;
  }

  onRowValidating(e) {
    const { isValid, component: grid } = e;

    if (isValid) {
      // NOTE: getController is NOT part of the DataGrid public API
      e.promise = grid.getController('data').refresh(true).done(() => {

        const limit = this.subtotalLimit;
        const subtotal = grid.getTotalSummaryValue('extendedPrice');    // refreshing updates this value
        const valid = subtotal <= limit;

        if (!valid) {
          e.isValid = false;

          const $subtotal = formatCurrency(subtotal, 'en-US', '$');
          const $limit = formatCurrency(limit, 'en-US', '$');
          const message = `
<div class="alert alert-warning">
    <p>The items you are entering will bring the subtotal to <strong>${$subtotal}</strong> which exceeds the <strong>${$limit}</strong> limit on <strong>Field Orders</strong>.</p>
</div>
<div class="alert alert-info">
    <p>If you require a higher limit you should create a <strong>Purchase Order</strong> instead.</p>
</div>`;

          alert(message, 'Price Limit Exceeded');
        }
      });
    }
  }

  updateOrder(e, field: string) {
    this.order[field] = e.value;

    this.saveOrder();
  }

  saveOrder() {
    this.notify({
      message: 'Saving...',
      elementAttr: { class: 'notification-service-toast simple-custom-toast' },
      contentTemplate: `<i class="fas fa-spinner fa-pulse"></i>`
    }, 'custom', 60000).then();

    this._service.updateOrder(this.order.id, this.order)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.order.save();
          this.notify('All changes saved', 'success', 5000).then(() => this.notification.skipToLast());
        },
        error: (error) => {
          this.notify(`Error: ${error}`, 'error', 5000).then(() => this.notification.skipToLast());
          console.warn({ ['saving error']: error });
        }
      });
  }

  onSaving(e) {
    // private api to get toolbar dropdown menu, completely inaccessible through public methods
    const dropDownMenu = e.component.getView('headerPanel')._toolbar._menuStrategy._menu;
    if (dropDownMenu.option('opened')) {
      // need to close the menu because it has errant behaviour when the notify popup appears
      dropDownMenu.close();
    }

    this.notify({
      message: 'Saving...',
      elementAttr: { class: 'notification-service-toast simple-custom-toast' },
      contentTemplate: `<i class="fas fa-spinner fa-pulse"></i>`
    }, 'custom', 60000).then();
  }

  onSaved(e) {
    const error: Error = e.error;

    if (error == undefined) {
      this.notify('All changes saved', 'success', 5000).then(() => this.notification.skipToLast());
    } else {
      // I'm unsure what an error here would likely be. API errors are handled in onDataErrorOccurred
      this.notify(`Error: ${error.message}`, 'error', 5000).then(() => this.notification.skipToLast());
      console.warn({ ['saving error']: error });
    }
  }

  onDataErrorOccurred(e) {
    // Provided error messages don't seem to be helpful
    this.notify('Error, changes could not be saved', 'error', 10000).then(() => this.notification.skipToLast());
    console.warn({ ['data error occurred']: e });
  }

  createLookups() {
    this.wbs = AspNetData.createStore({
      key: "value",
      loadUrl: this.endpoints.api.Lookups.GetProjectWBSAsLookup(),
      loadParams: { projectId: this.order.projectId },
      onLoaded: (loaded: any[]) => {
        FieldItem.wbs = getValueMapFromLookup(loaded);
      }
    });

    this.wbs.load();
  }

  createStores() {
    this.dataSource = AspNetData.createStore({
      key: "id",
      loadUrl: this.endpoints.api.OrderItems.GetOrderItemByOrderID(),
      loadParams: { id: this.order.id },
      insertUrl: this.endpoints.api.OrderItems.PostOrderItem(),
      updateUrl: this.endpoints.api.OrderItems.PutOrderItem(),
      deleteUrl: this.endpoints.api.OrderItems.DeleteOrderItemPretend(),
    });
  }

  ngOnInit() {
    this._service.orderParameters$.subscribe((params) => {
      this.orderId = params.orderId;
    });

    this.createLookups();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
