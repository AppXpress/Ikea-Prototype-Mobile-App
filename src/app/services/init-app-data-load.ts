//Handles Initial Data Before first display of App
import {Injectable} from "@angular/core";
import {GtnApiService} from "./gtn-api-service";
import {GTNDataTypes} from "../interfaces/app_constants";
import {AppDataHandler} from "./app-data-handler";
import {PicklistRegistryService} from "./picklist-registry";
import {GtnLocationService} from "./gtn-location-service";
import {GTNQueryResponse} from "../interfaces/api";

let initializePipelineRequests = [
  GTNDataTypes.StockTransferRequest + "/query",
  /* 'Location/query' Doesn't work with pipe requests */,
  'User/query'
];

@Injectable()
export class InitAppDataService {
  constructor(private gtnapi : GtnApiService,
              private appDataHandler : AppDataHandler,
              private picklistRegistry : PicklistRegistryService,
              private locationService : GtnLocationService) {}

  initialDataFetch() {
    this.locationService.fetch();
    return this.gtnapi.pipeline(initializePipelineRequests)
      .then((responseResultSet) => {
        let stockTransferQueryResult = responseResultSet[0].response.payload.result;
        //let locationQuery = responseResultSet[1].response.payload as GTNQueryResponse;
        let userQuery = responseResultSet[1].response.payload as GTNQueryResponse;
        this.appDataHandler.setInitializeStockTransferList(stockTransferQueryResult);
        this.picklistRegistry.setUserPicklist(userQuery);
        //this.locationService.setLocations(locationQuery);
      })
  }

}
