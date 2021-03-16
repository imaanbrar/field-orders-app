export {
  ScopeItem
}

const units: string[] = [
  "Base Lay",
  "Box",
  "Case",
  "cm",
  "Days",
  "Drum",
  "EA",
  "Feet",
  "Gallon",
  "Hour",
  "Inch",
  "kg",
  "km",
  "lbs",
  "Lot",
  "Lump Sum",
  "Meter",
  "Miles",
  "mm",
  "Month",
  "PKS",
  "Roll",
  "Sheet",
  "T&M",
  "UPI"
];

abstract class ScopeItem {

  public static emptyCollections = [
    'invoiceItem', 'itemLogistic','itemProductionMilestone', 'receivingItem', 'shippingItem', 'sqsReportItem'
  ];

  public static units: string[] = units;

}

declare namespace ScopeItem {

  interface Item {
    id: number;
    orderId: number;

    itemNumber: number;

    quantity: number;
    uom: string;
    description: string;

    rev: number;
    isDeleted: boolean;

    createdBy?: number;
    createdDate?: string | Date;
    modifiedBy?: number;
    modifiedDate?: string | Date;
  }

  interface Entry {
    Item: number;
    Quantity: number;
    UOM: string;
    Description: string;
    Deleted: string;
  }

}
