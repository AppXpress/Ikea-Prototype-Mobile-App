import {Injectable} from "@angular/core";
import {GtnApiService} from "./gtn-api-service";
import {GtnLocation} from "../interfaces/Location";
import {GTNQueryResponse} from "../interfaces/api";
import {PicklistRegistryService} from "./picklist-registry";

@Injectable()
export class GtnLocationService {

  locations : Array<GtnLocation>;
  constructor(private gtnapi : GtnApiService,private picklistRegistry : PicklistRegistryService){
    console.log('Hit GtnLocation Constructor');
  }

  fetch() {
    this.gtnapi.query('Location')
      .then( response => this.setLocations(response) )
      .catch( e=> {
        console.warn('Locations API call failed');
    })
  }

  setLocations( response : GTNQueryResponse ){
    this.locations = response.result.filter( (loc : GtnLocation) => {
      return loc.latitude != undefined && loc.longitude != undefined;
    }) as Array<GtnLocation>;
    this.picklistRegistry.setLocationPicklist(this.locations);
  }

  getLocations() : Array<GtnLocation>{
    return this.locations || [];
  }

  getLocation(key : string) : GtnLocation{
    return this.locations.find( location => location.longName == key );
  }
}
