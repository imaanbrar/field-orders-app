import {
  AfterContentChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
}                                                  from '@angular/core';
import { eOrderStatus }                            from "@app/shared/enums/eOrderStatus";
import { LoggedInUser }                            from "@app/shared/models/LoggedInUser";
import { ApiEndpointService }                      from "@app/shared/services/api-endpoint.service";
import { EditorStateService }                      from "@app/shared/services/editor-state.service";
import { NotificationService }                     from "@app/shared/services/notification.service";
import { UserService }                             from "@app/shared/services/user.service";
import { ScreenService }                           from "@app/shared/services";
import { FieldOrder }                              from "@orders/models/field/field-order";
import { OrderService }                            from "@orders/services/order.service";
import autobind                                    from "autobind-decorator";
import { DxFormComponent }                         from "devextreme-angular";
import * as AspNetData                             from "devextreme-aspnet-data-nojquery";
import CustomStore                                 from "devextreme/data/custom_store";
import DataSource                                  from "devextreme/data/data_source";
import { confirm }                                 from "devextreme/ui/dialog";
import { OnChange, SimpleChange }                  from "property-watch-decorator";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { finalize, retry, takeUntil }              from "rxjs/operators";
import Notifier = NotificationService.Notifier;

@Component({
  selector: 'field-order-details-main',
  templateUrl: './field-order-details-main.component.html',
  styleUrls: ['./field-order-details-main.component.scss']
})
export class FieldOrderDetailsMainComponent implements OnInit, OnDestroy, AfterContentChecked {

  private orderClass = FieldOrder;

  @OnChange('onOrderSet')
  @Input() orderMain: FieldOrder;

  @Input() setOrderOpen: EventEmitter<never>;
  @Input() setOrderDeleted: EventEmitter<never>;

  @Output() saved   = new EventEmitter<boolean>();
  @Output() invalid = new EventEmitter<never>();

  @OnChange('setMainForm')
  @ViewChild("form")
  form: DxFormComponent;

  @OnChange('setContactForm')
  @ViewChild('vendorContact')
  vendorContact: DxFormComponent;

  @OnChange('setLocationForm')
  @ViewChild('vendorLocation')
  vendorLocation: DxFormComponent;

  order: FieldOrder = new FieldOrder({});
  orderId: number;
  projectId: number;

  loggedInUser: LoggedInUser;

  companies: CustomStore;
  projects: CustomStore;
  statuses: CustomStore;
  shippingMethods: CustomStore;

  contacts: DataSource;

  loading: boolean = true;

  dirtyFields: string[] = [];

  private _dirty: boolean         = false;
  dirty: BehaviorSubject<boolean> = new BehaviorSubject(false);

  indicators = {
    savingVisible: false,
  };

  popups = {
    companyVisible: false,
    projectVisible: false,
  };

  private endpoints: typeof ApiEndpointService;

  private destroyed: Subject<void> = new Subject();

  window = Window;

  autoSave: boolean;

  notify: Notifier;

  constructor(
    protected _service: OrderService,
    protected cd: ChangeDetectorRef,
    protected editorState: EditorStateService,
    public screen: ScreenService,
    protected notification: NotificationService) {

    this.endpoints    = ApiEndpointService;
    this.loggedInUser = UserService.loggedInUser;

    screen.onBeforeMobileSwitched
          .pipe(takeUntil(this.destroyed))
          .subscribe(() => {
            this.form && this.form.instance.beginUpdate();
            this.vendorContact && this.vendorContact.instance.beginUpdate();
            this.vendorLocation && this.vendorLocation.instance.beginUpdate();
          });

    screen.onAfterMobileSwitched
          .pipe(takeUntil(this.destroyed))
          .subscribe(() => {
            this.form && this.form.instance.endUpdate();
            this.vendorContact && this.vendorContact.instance.endUpdate();
            this.vendorLocation && this.vendorLocation.instance.endUpdate();
          });

    combineLatest([ editorState.dirty$, screen.isMobile ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([ dirty, autoSave ]) => {
        this.autoSave = autoSave;

        if (dirty && autoSave) {
          this.saveChanges();
        } else if (autoSave) {
          this.form && this.form.instance.validate();
        }
      });

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

  joinItems(items: string[], delimiter: string = ','): string {
    return items.filter(item => item != undefined)
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .join(delimiter);
  }

  @autobind
  orderNumberValidationCallback(e) {
    if (e.value) {
      this._service.checkOrderNumber(this.order.id, this.order.projectId, e.value)
          .subscribe(found => {
            e.rule.isValid = !found;
            e.rule.message = "Field Order Number must be unique with this Project";
            e.validator.validate();
          });
    }
    return true;
  }

  onFormFieldDataChanged(e): boolean {
    const key   = e.dataField;
    let changed = false;
    if (this.order.hasChanged(key)) {
      changed = true;
      if (this.dirtyFields.indexOf(key) === -1) {
        this.dirtyFields.push(key);
      }
    } else {
      const index = this.dirtyFields.indexOf(key);
      if (index > -1) {
        changed = true;
        this.dirtyFields.splice(index, 1);
      }
    }

    if (changed) {
      this.editorState.setDirty({ component: "Main", fields: this.dirtyFields });
    }

    this._dirty = this.dirtyFields.length > 0;

    return changed;
  }

  setClean() {
    this._dirty      = false;
    this.dirtyFields = [];
    this.editorState.setDirty({ component: "Main", fields: undefined });
    this.checkIsDirty();
  }

  checkIsDirty() {
    const dirty = this._dirty;
    if (this.dirty.getValue() !== dirty) {
      this.dirty.next(dirty);
    }
  }

  @autobind
  openClientPopup() {
    this.popups.companyVisible = true;
  }

  @autobind
  openProject() {
    this.popups.projectVisible = true;
  }

  @autobind
  openClientPopupMobile() {
    if (this.screen.isMobile.getValue()) {
      this.popups.companyVisible = true;
    }
  }

  @autobind
  openProjectMobile() {
    if (this.screen.isMobile.getValue()) {
      this.popups.projectVisible = true;
    }
  }

  onPopupClosed() {
    this.form.instance.validate();
  }

  onOriginatorOptionChanged(e) {
    if (e.name === 'usePopover') {
      const dataSource: DataSource = e.component.getDataSource();
      dataSource.pageIndex(0);
      dataSource.reload();
    }
  }

  setMainForm(form: DxFormComponent) {
    if (form != undefined) {
      this.order.fieldVendor.form = form;
    }
  }

  setLocationForm(form: DxFormComponent) {
    if (form != undefined) {
      this.order.fieldVendor.location.form = form;
    }
  }

  setContactForm(form: DxFormComponent) {
    if (form != undefined) {
      this.order.fieldVendor.contact.form = form;
    }
  }

  saveChanges() {
    if (this.form.instance.validate().isValid) {
      const order = this.order;
      Promise.resolve(order.cancelled || order.closed || order.onHold)
             .then(statusChanged => {
               return Promise.resolve(statusChanged
                                      ? confirm("<i>Are you sure you want to want to change the status?</i>", "Confirm changes")
                                      : true)
                             .then(confirmed => confirmed ? this.save() : null);
             });
    } else {
      this.notify('Invalid data, changes not saved', 'info', 5000).then();
    }
  }

  showSavingIndicator() {
    this.indicators.savingVisible = this.screen.isDesktop.getValue();
  }

  save() {
    this.showSavingIndicator();
    this.order.modifiedBy = this.loggedInUser.id;

    this.notify({
      message        : 'Saving...',
      elementAttr    : { class: 'notification-service-toast simple-custom-toast' },
      contentTemplate: `<i class="fas fa-spinner fa-pulse"></i>`
    }, 'custom', 60000).then();

    this._service.updateOrder(this.order.id, this.order)
        .pipe(
          finalize(() => {
            this.indicators.savingVisible = false;
          }),
          retry(2))
        .subscribe({
          complete: () => {
            this.order.save();
            this.setClean();
            this.notify({ message: 'All changes saved', visible: false }, 'success', 5000)
                .then(() => this.notification.skipToLast());
          },
          error   : () => {
            this.notify('Error, changes could not be saved', 'error', 10000).then(() => this.notification.skipToLast());
          }
        });
  }

  onOrderSet(order, change: SimpleChange<FieldOrder>) {
    if (order && order.id != undefined) {
      this.order = new this.orderClass(order);

      if (change.previousValue == undefined || change.previousValue.id == undefined) {
        this.loading = false;
        this.setClean();
      }

      this.order.fieldVendor.initForms();
      this.order.fieldVendor.form = this.form;
    }
  }

  @autobind
  onSetOrderOpen() {
    this.order.statusId = eOrderStatus.eInProgress;
    this.save();
  }

  @autobind
  onSetOrderDeleted() {
    this.order.statusId = eOrderStatus.eCancelled;
    this.save();
  }

  protected createStores() {
    this.companies = AspNetData.createStore({
      key    : "value",
      loadUrl: this.endpoints.api.Lookups.GetClientsLookup(),
    });

    this.projects = AspNetData.createStore({
      key    : "value",
      loadUrl: this.endpoints.api.Projects.GetAccessibleProjectsAsLookup(),
    });

    this.statuses = AspNetData.createStore({
      key    : "value",
      loadUrl: this.endpoints.api.Lookups.GetOrderStatusAsLookup(),
    });

    this.contacts = new DataSource({
      sort : [ { selector: 'search', desc: false } ],
      store: AspNetData.createStore({
        key    : "value",
        loadParams: { orderId: this.orderId },
        loadUrl: this.endpoints.api.Lookups.GetFieldOrderOriginatorNamesLookup(),
      })
    });

    this.shippingMethods = AspNetData.createStore({
      key    : "value",
      loadUrl: this.endpoints.api.Lookups.GetShippingMethodAsLookup(),
    });
  }

  ngOnInit() {
    if (this.setOrderOpen) {
      this.setOrderOpen.subscribe(this.onSetOrderOpen);
    }

    if (this.setOrderDeleted) {
      this.setOrderDeleted.subscribe(this.onSetOrderDeleted);
    }

    this._service.orderParameters$.subscribe((params) => {
      this.orderId = params.orderId;
    });

    this.createStores();
  }

  public ngAfterContentChecked(): void {
    // check if form is dirty after content checked to avoid save button disabled state change during change detection
    // which throws ExpressionChangedAfterItHasBeenCheckedError exception
    this.checkIsDirty();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
