import { ApiEndpointService }     from "@app/shared/services/api-endpoint.service";
import { AutocompleteController } from "@app/shared/classes/autocomplete-controller";
import { PopupForm }              from "@app/shared/classes/popup-form";
import { resolveNestedPath }      from "@app/shared/utils/resolveNestedPath";
import { setPropertyDescriptor }  from "@app/shared/utils/setPropertyDescriptor";
import autobind                   from "autobind-decorator";
import { DxFormComponent }        from "devextreme-angular";
import Autocomplete = AutocompleteController.Autocomplete;
import ContactData = FieldVendor.ContactData;
import FieldVendorData = FieldVendor.FieldVendorData;
import IFieldVendor = FieldVendor.IFieldVendor;
import LocationData = FieldVendor.LocationData;
import ValueSetter = PopupForm.ValueSetter;

export {
  FieldVendor
}

type Comparator = (a: any, b: typeof a) => boolean;

type FieldVendorDataPath = keyof FieldVendorData | [ 'location' | 'contact', keyof FieldVendorData ];

function isEmpty(value: string) {
  return value == undefined || value.trim().length === 0;
}

const autocompleteConfigs: Autocomplete.ConfigSet<FieldVendorData, FieldVendorDataPath> = {
  companyName: {
    setOnSelection: [ 'companyName' ]
  },

  locationAddress: {
    select        : [
      'locationAddress',
      'locationCity',
      'locationState',
      'locationCountry',
      'locationPostalCode',
      'locationEmail',
      'locationPhone',
      'locationFax'
    ],
    filterBy      : [ 'companyName' ],
    setOnSelection: [
      [ 'location', 'locationAddress' ],
      [ 'location', 'locationCity' ],
      [ 'location', 'locationState' ],
      [ 'location', 'locationCountry' ],
      [ 'location', 'locationPostalCode' ],
      [ 'location', 'locationEmail' ],
      [ 'location', 'locationPhone' ],
      [ 'location', 'locationFax' ],
    ],
    itemTemplate  : 'locationAddressTemplate'
  },

  locationCity: {
    select        : [ 'locationCity', 'locationState', 'locationCountry' ],
    setOnSelection: [
      [ 'location', 'locationCity' ],
      [ 'location', 'locationState' ],
      [ 'location', 'locationCountry' ]
    ],
    itemTemplate  : 'locationCityTemplate'
  },

  locationState: {
    select        : [ 'locationState', 'locationCountry' ],
    setOnSelection: [ [ 'location', 'locationState' ], [ 'location', 'locationCountry' ] ],
    itemTemplate  : 'locationStateTemplate'
  },

  locationCountry: {
    setOnSelection: [ [ 'location', 'locationCountry' ] ]
  },

  locationPostalCode: {
    setOnSelection: [ [ 'location', 'locationPostalCode' ] ],
    filterBy: [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
  },

  locationEmail: {
    setOnSelection: [ [ 'location', 'locationEmail' ] ],
    filterBy: [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
  },

  locationPhone: {
    setOnSelection: [ [ 'location', 'locationPhone' ] ],
    filterBy: [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
  },

  locationFax: {
    setOnSelection: [ [ 'location', 'locationFax' ] ],
    filterBy: [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
  },

  contactFirstName: {
    select        : [
      'contactFirstName',
      'contactLastName',
      'contactEmail',
      'contactPhone',
      'contactCell',
      'contactFax'
    ],
    filterBy      : [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
    setOnSelection: [
      [ 'contact', 'contactFirstName' ],
      [ 'contact', 'contactLastName' ],
      [ 'contact', 'contactEmail' ],
      [ 'contact', 'contactPhone' ],
      [ 'contact', 'contactCell' ],
      [ 'contact', 'contactFax' ],
    ],
    itemTemplate  : 'contactNameTemplate'
  },

  contactLastName: {
    select        : [
      'contactFirstName',
      'contactLastName',
      'contactEmail',
      'contactPhone',
      'contactCell',
      'contactFax'
    ],
    filterBy      : [ 'companyName', [ 'location', 'locationAddress' ], [ 'location', 'locationCity' ] ],
    setOnSelection: [
      [ 'contact', 'contactFirstName' ],
      [ 'contact', 'contactLastName' ],
      [ 'contact', 'contactEmail' ],
      [ 'contact', 'contactPhone' ],
      [ 'contact', 'contactCell' ],
      [ 'contact', 'contactFax' ],
    ],
    itemTemplate  : 'contactNameTemplate',
  },

  contactEmail: {
    setOnSelection: [ [ 'contact', 'contactEmail' ] ],
    filterBy: [ 'companyName', [ 'contact', 'contactFirstName' ], [ 'contact', 'contactLastName' ] ],
  },

  contactPhone: {
    setOnSelection: [ [ 'contact', 'contactPhone' ] ],
    filterBy: [ 'companyName', [ 'contact', 'contactFirstName' ], [ 'contact', 'contactLastName' ] ],
  },

  contactFax: {
    setOnSelection: [ [ 'contact', 'contactFax' ] ],
    filterBy: [ 'companyName', [ 'contact', 'contactFirstName' ], [ 'contact', 'contactLastName' ] ],
  },

  contactCell: {
    setOnSelection: [ [ 'contact', 'contactCell' ] ],
    filterBy: [ 'companyName', [ 'contact', 'contactFirstName' ], [ 'contact', 'contactLastName' ] ],
  }
}

class FieldVendor implements IFieldVendor {
  public id: number;
  public orderId: number;

  public companyName: string;

  public contactFirstName?: string;
  public contactLastName?: string;
  public contactPhone?: string;
  public contactEmail?: string;
  public contactCell?: string;
  public contactFax?: string;

  public locationAddress?: string;
  public locationCity?: string;
  public locationState?: string;
  public locationCountry?: string;
  public locationPostalCode?: string;
  public locationEmail?: string;
  public locationPhone?: string;
  public locationFax?: string;

  public companyId?: number;
  public companyContactId?: number;
  public companyLocationId?: number;

  public createdBy?: number;
  public createdDate?: string;
  public modifiedDate?: string;
  public modifiedBy?: number;

  private initialData: IFieldVendor;
  private excludedFields = [
    'fieldVendor.location.value',
    'fieldVendor.contact.value',
  ];

  public form: DxFormComponent;
  public autocomplete: FieldVendorData<AutocompleteController<FieldVendorData, FieldVendorDataPath>>;
  public fieldVendor: IFieldVendor;

  private _location?: LocationForm;
  private _contact?: ContactForm;

  constructor(orderId: number, props: any) {
    this.orderId = orderId;

    this.load(props);

    setPropertyDescriptor(this, 'company', { enumerable: false });
    setPropertyDescriptor(this, 'companyContact', { enumerable: false });
    setPropertyDescriptor(this, 'companyLocation', { enumerable: false });

    setPropertyDescriptor(this, 'form', { enumerable: false });
    setPropertyDescriptor(this, '_location', { enumerable: false });
    setPropertyDescriptor(this, '_contact', { enumerable: false });
    setPropertyDescriptor(this, 'autocomplete', { enumerable: false });
    setPropertyDescriptor(this, 'fieldVendor', { enumerable: false });
    setPropertyDescriptor(this, 'excludedFields', { enumerable: false });
  }

  public load(props: any): void {
    Object.assign(this, props);

    // proxy to map to form fields accessed relative to the main form i.e. fieldVendor.contactEmail
    delete props.fieldVendor;

    props.fieldVendor = new Proxy<IFieldVendor>(props, {
      get: Reflect.get
    });

    setPropertyDescriptor(props, 'fieldVendor', { enumerable: false });

    delete this.initialData;
    Object.defineProperty(this, 'initialData', {
      get: function () {
        return props;
      }
    });

    // console.log({ ['loaded field vendor']: this.initialData });
  }

  public save(): void {
    const initialData = this.initialData;
    Object.keys(initialData)
          .filter(key => key !== 'fieldVendor')
          .forEach(key => initialData[key] = this[key]);
  }

  public hasChanged(field: string, compare?: Comparator): boolean {
    if (this.excludedFields.includes(field)) {
      return false;
    }

    compare = compare || ((a: any, b: typeof a) => a !== b);

    let current = resolveNestedPath(this, field);
    let initial = resolveNestedPath(this.initialData, field);

    return compare(current, initial);
  }

  @autobind
  public validateName(e): boolean {
    const { value } = e;
    return !isEmpty(value) || (this.location.isEmpty() && this.contact.isEmpty());
  }

  public isValid(): boolean {
    return this.companyName != undefined && this.location.isValid();
  }

  public get isLocked(): boolean {
    return this.companyId != undefined && this.companyContactId != undefined && this.companyLocationId != undefined;
  }

  public get contact(): ContactForm {
    return this._contact;
  }

  public get location(): LocationForm {
    return this._location;
  }

  public get canExtractCompany(): boolean {
    return !isEmpty(this.companyName)
  }

  public get canExtractContact(): boolean {
    return !(isEmpty(this.contactFirstName) || isEmpty(this.contactLastName));
  }

  public get canExtractLocation(): boolean {
    return !(isEmpty(this.locationAddress) || isEmpty(this.locationCity));
  }

  @autobind
  protected saveValue(key: string, value: string) {
    this.form.instance.updateData(key, value);
  }

  @autobind
  protected setOnSelection(itemData: FieldVendorData, path: FieldVendorDataPath): void {
    let form: DxFormComponent;
    let key: keyof FieldVendorData;

    if (Array.isArray(path)) {
      //form = this[path[0]].;
      key  = path[1];
    } else {
      form = this.form;
      key  = path;
    }

    if (key in itemData) {
      form.instance.updateData(`fieldVendor.${ key }`, itemData[key]);
      form.instance.validate();
    }
  }

  public initForms(): void {
    if (!(this._location instanceof LocationForm && this._contact instanceof ContactForm)) {

      this._location = new LocationForm(this, this.saveValue);
      this._contact  = new ContactForm(this, this.saveValue);

      // proxy to map to form fields accessed relative to the main form i.e. fieldVendor.contactEmail
      this.fieldVendor = new Proxy<IFieldVendor>(this, {
        get: Reflect.get,
        set: Reflect.set,
      });

      Object.keys(autocompleteConfigs).forEach(key => {
        autocompleteConfigs[key].setValue = this.setOnSelection;
      });

      this.autocomplete = {
        companyName       : new FieldVendorAutocomplete(this, 'companyName', autocompleteConfigs.companyName),
        locationAddress   : new FieldVendorAutocomplete(this, 'locationAddress', autocompleteConfigs.locationAddress),
        locationCity      : new FieldVendorAutocomplete(this, 'locationCity', autocompleteConfigs.locationCity),
        locationState     : new FieldVendorAutocomplete(this, 'locationState', autocompleteConfigs.locationState),
        locationCountry   : new FieldVendorAutocomplete(this, 'locationCountry', autocompleteConfigs.locationCountry),
        locationPostalCode: new FieldVendorAutocomplete(this, 'locationPostalCode', autocompleteConfigs.locationPostalCode),
        locationPhone     : new FieldVendorAutocomplete(this, 'locationPhone', autocompleteConfigs.locationPhone),
        locationEmail     : new FieldVendorAutocomplete(this, 'locationEmail', autocompleteConfigs.locationEmail),
        locationFax       : new FieldVendorAutocomplete(this, 'locationFax', autocompleteConfigs.locationFax),
        contactFirstName  : new FieldVendorAutocomplete(this, 'contactFirstName', autocompleteConfigs.contactFirstName),
        contactLastName   : new FieldVendorAutocomplete(this, 'contactLastName', autocompleteConfigs.contactLastName),
        contactEmail      : new FieldVendorAutocomplete(this, 'contactEmail', autocompleteConfigs.contactEmail),
        contactPhone      : new FieldVendorAutocomplete(this, 'contactPhone', autocompleteConfigs.contactPhone),
        contactFax        : new FieldVendorAutocomplete(this, 'contactFax', autocompleteConfigs.contactFax),
        contactCell       : new FieldVendorAutocomplete(this, 'contactCell', autocompleteConfigs.contactCell),
      };
    }
  }
}

class LocationForm extends PopupForm<LocationData> implements LocationData {
  public locationAddress?: string;
  public locationCity?: string;
  public locationState?: string;
  public locationCountry?: string;
  public locationPostalCode?: string;
  public locationEmail?: string;
  public locationPhone?: string;
  public locationFax?: string;

  readonly properties = [
    'fieldVendor.locationAddress',
    'fieldVendor.locationCity',
    'fieldVendor.locationState',
    'fieldVendor.locationCountry',
    'fieldVendor.locationPostalCode',
    'fieldVendor.locationEmail',
    'fieldVendor.locationPhone',
    'fieldVendor.locationFax'
  ];

  public fieldVendor: LocationData;

  constructor(protected data: FieldVendor, protected saveValue: ValueSetter) {
    super(data, saveValue);

    // proxy to map to form fields accessed relative to the main form i.e. fieldVendor.contactEmail
    this.fieldVendor = new Proxy<LocationData>(this, {
      get: Reflect.get,
      set: Reflect.set,
    });
  }

  public get value(): string {
    const location = [ this.data.locationAddress, this.data.locationCity ];
    return location.filter(field => field && field.trim().length > 0).join(', ');
  }

  public get defaultFieldName(): string {
    return 'fieldVendor.locationAddress';
  }

  hasRequiredFields(): boolean {
    const { data } = this;
    return !isEmpty(data.locationAddress) && !isEmpty(data.locationCity);
  }

  isEmpty(): boolean {
    const { data } = this;
    return isEmpty(data.locationAddress) && isEmpty(data.locationCity) && isEmpty(data.locationState) &&
           isEmpty(data.locationCountry) && isEmpty(data.locationPostalCode) && isEmpty(data.locationEmail) &&
           isEmpty(data.locationPhone) && isEmpty(data.locationFax);
  }

  @autobind
  isValid(): boolean {
    return this.data.contact.isEmpty() || this.hasRequiredFields();
  }

  @autobind
  locationAddressValid(): boolean {
    return this.data.contact.isEmpty() || !isEmpty(this.locationAddress);
  }

  @autobind
  locationCityValid(): boolean {
    return this.data.contact.isEmpty() || !isEmpty(this.locationCity);
  }
}

class ContactForm extends PopupForm<ContactData> implements ContactData {
  public contactFirstName?: string;
  public contactLastName?: string;
  public contactPhone?: string;
  public contactEmail?: string;
  public contactCell?: string;
  public contactFax?: string;

  readonly properties = [
    'fieldVendor.contactFirstName',
    'fieldVendor.contactLastName',
    'fieldVendor.contactPhone',
    'fieldVendor.contactEmail',
    'fieldVendor.contactCell',
    'fieldVendor.contactFax'
  ];

  public fieldVendor: ContactData;

  constructor(protected data: FieldVendor, protected saveValue: ValueSetter) {
    super(data, saveValue);

    // proxy to map to form fields accessed relative to the main form i.e. fieldVendor.contactEmail
    this.fieldVendor = new Proxy<ContactData>(this, {
      get: Reflect.get,
      set: Reflect.set,
    });
  }

  public get value(): string {
    const contact = [ this.data.contactFirstName, this.data.contactLastName ];
    return contact.filter(name => name && name.trim().length > 0).join(' ');
  }

  public get defaultFieldName(): string {
    return 'fieldVendor.contactFirstName';
  }

  isEmpty(): boolean {
    const { data } = this;
    return isEmpty(data.contactFirstName) && isEmpty(data.contactLastName) && isEmpty(data.contactEmail) &&
           isEmpty(data.contactPhone) && isEmpty(data.contactCell) && isEmpty(data.contactFax);
  }

  hasName(): boolean {
    return !isEmpty(this.contactFirstName) && !isEmpty(this.contactLastName);
  }

  @autobind
  isValid(): boolean {
    return true;
  }
}

class FieldVendorAutocomplete extends AutocompleteController<FieldVendorData, FieldVendorDataPath> {

  constructor(
    protected data: FieldVendorData,
    public key: keyof FieldVendorData,
    config: Autocomplete.Config<FieldVendorData, FieldVendorDataPath> = {}) {

    super(data, key, config);
  }

  protected loadUrl(): string {
    return ApiEndpointService.api.FieldVendors[`Autocomplete${ this.data }`]();
  }
}

declare namespace FieldVendor {
  interface IFieldVendor extends FieldVendorData {
    id: number;
    orderId: number;

    contact: ContactForm;
    location: LocationForm;

    companyId?: number;
    companyContactId?: number;
    companyLocationId?: number;

    createdBy?: number;
    createdDate?: string;
    modifiedBy?: number;
    modifiedDate?: string;
  }

  interface FieldVendorData<T = string> extends ContactData<T>, LocationData<T> {
    companyName: T;
  }

  interface ContactData<T = string> {
    contactFirstName?: T;
    contactLastName?: T;
    contactPhone?: T;
    contactEmail?: T;
    contactCell?: T;
    contactFax?: T;
  }

  interface LocationData<T = string> {
    locationAddress?: T;
    locationCity?: T;
    locationState?: T;
    locationCountry?: T;
    locationPostalCode?: T;
    locationPhone?: T;
    locationFax?: T;
    locationEmail?: T;
  }
}
