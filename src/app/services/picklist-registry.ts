import {Injectable} from "@angular/core";
import {Picklist, PicklistRegistryKeys} from "../interfaces/picklist";
import {GtnApiService} from "./gtn-api-service";
import {GTNQueryResponse} from "../interfaces/api";
import {GtnLocation} from "../interfaces/Location";

const UserPicklistLabel = "login";
const UserPicklistKey = "numericUid";
const LocationPicklistLabel = "longName";
const LocationPicklistKey = "longName";

@Injectable()
export class PicklistRegistryService {

  picklistRegistry : Map<PicklistRegistryKeys,Picklist> = new Map();
  constructor(private gtnapi : GtnApiService) {}

  getPicklist(key : PicklistRegistryKeys) : Picklist {
    if( this.picklistRegistry.get(key) )
      return this.picklistRegistry.get(key);
    else{
      console.warn('Cannot find picklist ' + key );
      return <Picklist>{ items : [] };
    }
  }

  getLabel(key : PicklistRegistryKeys , itemKey : string ){
    let label = null;
    this.picklistRegistry.get(key).items.forEach( (item) => {
      if( item.key === itemKey )
        label = item.label;
    });
    return label ? label : itemKey;
  }

  setLocationPicklist(locations : Array<GtnLocation>) {
    let locationPicklist : Picklist = {
      items : locations.map( (loc : GtnLocation) => {
        return {
          key : loc[LocationPicklistKey],
          label : loc[LocationPicklistLabel]
        }
      })
    };
    this.picklistRegistry.set(PicklistRegistryKeys.Locations, locationPicklist);
  }

  setUserPicklist(  queryResponse : GTNQueryResponse ) {
    console.log('Load User Picklist');
    let userArray : Picklist = {
      items : queryResponse.result.map( (user) => {
        return {
          key : user[UserPicklistKey],
          label : user[UserPicklistLabel]
        }
      })
    };
    this.picklistRegistry.set(PicklistRegistryKeys.USERS , userArray);
  }
}
