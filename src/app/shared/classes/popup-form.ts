import { resolveNestedPath } from "@app/shared/utils/resolveNestedPath";
import { setNestedPath }     from "@app/shared/utils/setNestedPath";
import autobind              from "autobind-decorator";
import { DxFormComponent }   from "devextreme-angular";
import notify                from "devextreme/ui/notify";
import Dictionary = PopupForm.Dictionary;
import ValueSetter = PopupForm.ValueSetter;

export {
  PopupForm
}

abstract class PopupForm<T extends Dictionary> {

  public visible: boolean = false;

  public form: DxFormComponent;

  readonly properties: string[] = [];

  protected constructor(protected data: T, protected saveValue: ValueSetter) {
  }

  public abstract get value(): string;

  protected abstract get defaultFieldName(): string;

  public load() {
    this.properties.map(key => {
      if (this.form != undefined) {
        this.form.instance.updateData(key, resolveNestedPath(this.data, key));
      } else {
        setNestedPath(this, resolveNestedPath(this.data, key), key);
      }
    });
  }

  public save() {
    this.properties.map(key => {
      this.saveValue(key, resolveNestedPath(this, key));
    });
  }

  public onShowing(e) {
    e.component.repaint();
  }

  public onShown() {
    const defaultFieldName = this.defaultFieldName;
    if (this.defaultFieldName != undefined) {
      this.form.instance.getEditor(defaultFieldName).focus();
    }
  }

  @autobind
  public showPopup(e) {
    this.load();
    this.visible = true;
    e.component.blur();
  }

  @autobind
  public cancelEdit() {
    this.visible = false;
  }

  @autobind
  public saveEdit() {
    const validation = this.form && this.form.instance.validate();
    if (validation.isValid) {
      this.save();
      this.visible = false;
    } else {
      validation.brokenRules.forEach(rule => notify(rule.message, 'error', 2000));
    }
  }

  @autobind
  public clearForm() {
    this.properties.map(key => {
      this.form.instance.updateData(key, null);
    });
  }
}

declare namespace PopupForm {
  type Dictionary = { [k in string | number | symbol]: any };
  type ValueSetter = (key: string | number | symbol, value: any) => void;
}
