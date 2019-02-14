export enum PicklistRegistryKeys {
  USERS,
  Locations
}

export interface Picklist{
  items : Array<PicklistItem>
}

export interface PicklistItem{
  label : string,
  key : string
}
