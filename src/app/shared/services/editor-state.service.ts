import { Injectable }                  from '@angular/core';
import autobind                        from "autobind-decorator";
import { confirm }                     from 'devextreme/ui/dialog';
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime }                from "rxjs/operators";
import DirtyComponent = EditorStateService.DirtyComponent;
import DirtyField = EditorStateService.DirtyField;

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {

  private _dirty: { [k: string]: DirtyField} = {};

  private _dirty$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _disabled?: () => boolean = () => false;

  public get unsavedConfirmation(): string {
    return `
<div class="alert alert-warning">
    <strong>Warning! You have unsaved changes.</strong>
    <i>  Are you sure you want to proceed?</i>
</div>
<div class="alert alert-info">
    <strong>Unsaved Items:</strong>
    <i>${ this.dirty.join() }</i>
</div>`
  };

  constructor() { }

  get dirty$(): Observable<boolean> {
    return this._dirty$.asObservable().pipe(debounceTime(100));
  }

  get dirty() {
    return Object.keys(this._dirty).filter(this.checkDirty);
  }

  isDisabled(): boolean {
    return this._disabled();
  }

  getDisabled(): () => boolean {
    return this._disabled;
  }

  setDisabled(disabled: (() => boolean) | Observable<boolean>) {
    // console.log('setDisabled', disabled.toString());
    if (disabled instanceof Observable) {
      disabled.subscribe((value) => {
        this._disabled = () => value;
      })
    } else {
      this._disabled = disabled;
    }
  }

  checkIsDirty(): boolean {
    // console.log({dirty: this._dirty, checkIsDirty: this.dirty, disabled: this._disabled.toString(), isDisabled: this.isDisabled()});
    return !this.isDisabled() && this.dirty.length > 0;
  }

  @autobind
  checkDirty(key: string): boolean {
    const isDirty = this._dirty[key];
    if (typeof isDirty === 'boolean') {
      return isDirty;
    } else if (typeof isDirty === 'function') {
      return isDirty();
    } else if (isDirty != undefined) {
      return isDirty.length > 0;
    }
    return false;
  }

  setClean(): void {
    // console.log('setClean: All');
    this._dirty = {};
    this._dirty$.next(false);
  }

  confirmPopup(messageHtml?: string): Promise<boolean> {
    messageHtml = messageHtml || this.unsavedConfirmation;
    return Promise.resolve(this.checkIsDirty())
                  .then(isDirty => isDirty ? confirm(messageHtml, 'Confirm') : true);
  }

  getDirty(key: string): DirtyField {
    return this._dirty[key];
  }

  setDirty(dirtyComponent: DirtyComponent) {
    const { component, fields } = dirtyComponent;
    if (fields != undefined) {
      this._dirty[component] = fields;
    } else {
      delete this._dirty[component];
    }

    this._dirty$.next(this.checkIsDirty());

    // console.log(`setDirty: ${component}`, fields, this._dirty);
  }
}

declare namespace EditorStateService {

  type DirtyField = string[] | boolean | (() => boolean) | undefined;

  type DirtyComponent = {
    component: string;
    fields: DirtyField;
  }
}

