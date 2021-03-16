enum eControllers {
  FieldOrders              = "FieldOrders",
  FieldVendors             = "FieldVendors",
  Lookups                  = "Lookups",
  Orders                   = "Orders",
  OrderComments            = "OrderComments",
  OrderItems               = "OrderItems",
  Projects                 = "Projects",
  ProjectWbs               = "ProjectWbs",
  RecentOrders             = "RecentOrders",
  Users                    = "Users"
}

namespace eControllers {
  export type Key = keyof typeof eControllers;
}

export {
  eControllers
}
