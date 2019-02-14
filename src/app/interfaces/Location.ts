import {GtnCustomObject} from "./api";

export interface GtnLocation extends GtnCustomObject{
  ownerOrganization : {
    organizationUid : string
  },
  name : string,
  longName : string,
  latitude : string,
  longitude : string,
  locationTypeCode : string
}
