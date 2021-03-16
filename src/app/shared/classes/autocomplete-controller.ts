import { resolveNestedPath } from "@app/shared/utils/resolveNestedPath";
import { setNestedPath }     from "@app/shared/utils/setNestedPath";
import autobind              from "autobind-decorator";
import * as AspNetData       from "devextreme-aspnet-data-nojquery";
import DataSource            from "devextreme/data/data_source";
import Autocomplete = AutocompleteController.Autocomplete;
import DataPath = AutocompleteController.DataPath;
import Dictionary = AutocompleteController.Dictionary;

export {
  AutocompleteController
}

abstract class AutocompleteController<T extends Dictionary, U extends DataPath = keyof T> {
  public readonly dataSource: DataSource;

  public readonly options: any;

  public readonly field: string;

  protected filterBy: Array<U>;

  protected setOnSelection: Array<U>;

  protected constructor(protected data: T, public key: string, config: Autocomplete.Config<T, U> = {}) {

    this.field = key.charAt(0).toUpperCase() + key.slice(1);

    // this.dataSource = new DataSource({
    //   key       : key,
    //   searchExpr: config.searchExpr || [ key ],
    //   select    : config.select || [ key ],
    //   store     : AspNetData.createStore({
    //     loadUrl: this.loadUrl(),
    //   })
    // });

    this.dataSource = new DataSource({
      key       : key,
      searchExpr: [ key ],
      select    : config.select || [ key ],
      store     : AspNetData.createStore({
             loadUrl: this.loadUrl(),
           })
    });

    this.options = {
      spellcheck     : 'spellcheck' in config ? config.spellcheck : false,
      showClearButton: 'showClearButton' in config ? config.showClearButton : true,
      dataSource     : this.dataSource,
      valueExpr      : config.valueExpr || key,
      itemTemplate   : config.itemTemplate,
      onFocusIn      : this.updateDataSourceFilter,
      onItemClick    : this.onAutocomplete,
      valueChangeEvent: 'change blur focusOut',
    }

    this.filterBy       = config.filterBy;
    this.setOnSelection = config.setOnSelection;
    this.setValue       = config.setValue || this.setValue;
  }

  protected abstract loadUrl(): string;

  @autobind
  protected updateDataSourceFilter(): void {
    if (this.filterBy != undefined) {
      const filter = this.filterBy.reduce((filters, path) => {
        const value = resolveNestedPath(this.data, path);
        if (value != undefined) {
          const key = Array.isArray(path) ? path[path.length - 1] : path;
          filters.push('and', [ key, '=', value ]);
        }
        return filters;
      }, [] as Autocomplete.Filter<T>);

      filter.shift();

      this.dataSource.filter(filter.length > 0 ? filter : null);
    }
  }

  @autobind
  protected onAutocomplete(e: any) {
    // In the case when you modify a value then click to autocomplete back to the original value, the control hasn't yet
    // registered a change, so it checks against the unchanged value and determines it nothing changed and the
    // autocomplete doesn't apply. Dispatching a change event here makes the control pick up the current form value.
    e.component.field().dispatchEvent(new Event('change'));

    const { itemData } = e;
    if (Array.isArray(this.setOnSelection)) {
      this.setOnSelection.forEach(path => {
        this.setValue(itemData, path);
      });

      this.updateDataSourceFilter();
    }
  }

  protected setValue(itemData: T, path: U) {
    setNestedPath(this.data, resolveNestedPath(itemData, path), path);
  }
}

declare namespace AutocompleteController {
  type Dictionary = { [k in string | number | symbol]: any };
  type DataPath = string | number | symbol | Array<string | number | symbol>;
  type SearchOperation = '=' | '<>' | '>' | '>=' | '<' | '<=' | 'startswith' | 'endswith' | 'contains' | 'notcontains';
  type Filter<T> = [ keyof T, SearchOperation, any ];

  namespace Autocomplete {
    type Filter<T> = Array<AutocompleteController.Filter<T> | 'and' | 'or'>;
    type ConfigSet<T extends Dictionary, U extends DataPath = DataPath> = { [k in keyof T]: Config<T, U> }
    type Setter<T extends Dictionary, U extends DataPath> = (itemData: T, path: U) => void;

    interface Config<T extends Dictionary, U extends DataPath> {
      setValue?: Autocomplete.Setter<T, U>

      // dataSource options
      searchExpr?: Array<keyof T>;
      select?: Array<keyof T>;
      filterBy?: Array<U>;

      // autocomplete options
      spellcheck?: boolean;
      showClearButton?: boolean;
      valueExpr?: keyof T;
      itemTemplate?: string;
      setOnSelection?: Array<U>;
    }
  }
}
