import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoggedInUser }                                   from "@app/shared/models/LoggedInUser";
import { ApiEndpointService }                             from "@app/shared/services/api-endpoint.service";
import { EditorStateService }                             from "@app/shared/services/editor-state.service";
import { NotificationService }                            from "@app/shared/services/notification.service";
import { UserService }                                    from "@app/shared/services/user.service";
import { ScreenService }                                  from "@app/shared/services";
import { getValueMapFromLookup }                          from "@app/shared/utils/getValueMapFromLookup";
import { FieldOrder }                                     from "@orders/models/field/field-order";
import { OrderComment }                                   from "@orders/models/order-comment";
import { OrderService }                                   from "@orders/services/order.service";
import autobind                                           from "autobind-decorator";
import { DxDataGridComponent }                            from "devextreme-angular";
import * as AspNetData                                    from "devextreme-aspnet-data-nojquery";
import CustomStore                                        from "devextreme/data/custom_store";
import { DataSourceOptions }                              from "devextreme/data/data_source";
import dxTextArea                                         from "devextreme/ui/text_area";
import { OnChange }                                       from "property-watch-decorator";
import { Subject }                                        from "rxjs";
import { takeUntil }                                      from "rxjs/operators";
import Notifier = NotificationService.Notifier;

@Component({
  selector   : 'field-order-details-notes',
  templateUrl: './field-order-details-notes.component.html',
  styleUrls  : [ './field-order-details-notes.component.scss' ]
})
export class FieldOrderDetailsNotesComponent implements OnInit, OnDestroy {

  @OnChange('onGridSet')
  @ViewChild("commentsGrid") dataGrid: DxDataGridComponent;

  @OnChange('onOrderSet')
  @Input() order: FieldOrder;

  orderId: number;

  dataSource: CustomStore;
  private _categories: CustomStore;
  private _subcategories: CustomStore;

  popups = {
    excelImportVisible: false
  };

  loggedInUser: LoggedInUser;

  importModel = OrderComment;

  private endpoints: typeof ApiEndpointService;

  private comment: dxTextArea;

  private notify: Notifier;

  private destroyed: Subject<void> = new Subject();

  constructor(
    private _service: OrderService,
    private editorState: EditorStateService,
    public screen: ScreenService,
    private notification: NotificationService) {

    this.endpoints    = ApiEndpointService;
    this.loggedInUser = UserService.loggedInUser;

    this.notify = notification.getNotifier({
        position : {
          my       : 'right top',
          at       : 'right top',
          of       : window,
          boundary : '#buttonBar',
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

  get exportFileName(): string {
    return `[${ this.order.number }] ${ this.order.name } - Notes`;
  }

  onToolbarPreparing(e) {
    const isMobile  = this.screen.isMobile.getValue();
    const isDesktop = !isMobile;

    e.toolbarOptions.items.unshift({
      location    : 'before',
      widget      : 'dxButton',
      locateInMenu: isDesktop ? 'auto' : 'always',
      options     : {
        text   : 'Import From Excel',
        onClick: this.showImport
      }
    });

    const addRow = e.toolbarOptions.items.find(item => {
      return item.name === 'addRowButton';
    });

    if (addRow != null) {
      addRow.locateInMenu = 'never';
      addRow.showText     = isMobile ? 'always' : 'inMenu';
      addRow.options.text = addRow.options.hint = 'Add Item';
    }

    const exportButton = e.toolbarOptions.items.find(item => {
      return item.name === 'exportButton';
    });

    if (exportButton != null) {
      exportButton.locateInMenu = isDesktop ? 'auto' : 'always';
    }
  }

  onEditorPrepared(e) {
    if (e.parentType === 'dataRow' && e.name === 'comment') {
      this.comment = dxTextArea.getInstance(e.editorElement) as dxTextArea;
    }
  }

  newRowEvent(e) {
    e.data.orderId       = this.order.id;
    e.data.commentDate   = new Date();
    //e.data.createdBy     = this.loggedInUser.id;
    e.data.createdBy     = 1;

    const { component } = e;

    // the following is required to select the 'comment' cell by default when a new row is created
    const onRowPrepared = (row) => {
      if (component.getCellElement(row.rowIndex, 'comment') != undefined) {

        const onEditorPrepared = () => {
          component.off('editorPrepared', onEditorPrepared);

          // this (conveniently) doesn't appear to function when importing from excel, and I'm unsure as to why that is.
          // My guess is that the input is focused but gets blurred at some point during the import process.
          component.editCell(row.rowIndex, component.getVisibleColumnIndex('comment'));
        }

        component.off('rowPrepared', onRowPrepared);
        component.on('editorPrepared', onEditorPrepared);
      }
    }

    component.on('rowPrepared', onRowPrepared);
  }

  onSaving() {
    this.notify({
      message        : 'Saving...',
      elementAttr    : { class: 'notification-service-toast simple-custom-toast' },
      contentTemplate: `<i class="fas fa-spinner fa-pulse"></i>`
    }, 'custom', 60000).then();
  }

  onSaved(e) {
    const error: Error = e.error;

    if (error == undefined) {
      this.notify('All changes saved', 'success', 5000).then(() => this.notification.skipToLast());
    } else {
      // I'm unsure what an error here would likely be. API errors are handled in onDataErrorOccurred
      this.notify(`Error: ${ error.message }`, 'error', 5000).then(() => this.notification.skipToLast());
      console.warn({ ['saving error']: error });
    }
  }

  onDataErrorOccurred(e) {
    // Provided error messages don't seem to be helpful
    this.notify('Error, changes could not be saved', 'error', 10000).then(() => this.notification.skipToLast());
    console.warn({ ['data error occurred']: e });
  }

  @autobind
  onPopupShown() {
    this.comment && this.comment.focus();
  }

  @autobind
  showImport() {
    this.popups.excelImportVisible = true;
  }

  @autobind
  importDataAdded() {
    this.popups.excelImportVisible = false;
  }

  @autobind
  isDirty(): boolean {
    return false;
  }

  setDirty(): void {
    this.editorState.setDirty({ component: 'Notes', fields: this.isDirty });
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

  getSubCategories(e) {
    console.log({ getSubCategories: e });
  }

  createStores() {
    this.dataSource = AspNetData.createStore({
      key       : "id",
      loadUrl   : this.endpoints.api.OrderComments.GetOrderCommentByOrderID(),
      loadParams: { id: this.order.id },
      insertUrl : this.endpoints.api.OrderComments.PostOrderComment(),
      updateUrl : this.endpoints.api.OrderComments.PutOrderComment(),
      deleteUrl : this.endpoints.api.OrderComments.DeleteOrderComment(),
    });
  }

  ngOnInit() {

    this._service.orderParameters$.subscribe((params) => {
      this.orderId = params.orderId;
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
