/*
    General Service Usage
    This service handles all the app data received over the GTN API
    Components will call into functions which will return observables
    We check to see if we have already fetched the data result from the API
    If we have, return it. If we have not, fetch it
 */
import {Injectable} from '@angular/core';
import {GtnApiService} from "./gtn-api-service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {$StockTransferRequestS1, GTNQueryResponse} from "../interfaces/api";
import {
  GTNDataTypes,
  StockTransferRequestListType,
  StockTransferRequests_OQL_QUERY,
  STR_Workflow_States
} from "../interfaces/app_constants";
import {RequestInstanceHandler} from "./request-instance-handler";
import {InstanceStream} from "../interfaces/app_streams";

@Injectable()
export class AppDataHandler {

  stockTransferList_ALL : Array<$StockTransferRequestS1> = [] ;
  stockTransferList_REQUEST : Array<$StockTransferRequestS1>;
  stockTransferList_DRAFTS : Array<$StockTransferRequestS1>;
  stockTransferList_ACCEPTED : Array<$StockTransferRequestS1>;

  private currentDataList : BehaviorSubject<$StockTransferRequestS1[]> = new BehaviorSubject( [] );

  constructor(private gtnApi : GtnApiService , private instanceHandler : RequestInstanceHandler ) {
    instanceHandler.getInstanceStream().asObservable()
      .subscribe( (instanceStreamData : InstanceStream ) => {
        console.log('Reconsile Saved Instance');
        this.reconcileUpdatedInstance(instanceStreamData);
      })
  }

  public currentListObserver() : BehaviorSubject<$StockTransferRequestS1[]> {
    return this.currentDataList;
  }

  public setInitializeStockTransferList( resultSet : Array<$StockTransferRequestS1>) {
    this.stockTransferList_ALL = resultSet;
    this.currentDataList.next(resultSet);
  }

  public getStockTransferList(type : StockTransferRequestListType ) : Observable<$StockTransferRequestS1[]> {
    if(type == StockTransferRequestListType.ALL)
      return this._AllStockTransferList().map( (list) => {
        console.log('getting all');
        this.stockTransferList_ALL = list;
        this.currentDataList.next(list);
        return list;
      });
    else if(type == StockTransferRequestListType.REQUESTS)
      return this._getRequestedStockTransferList().map( (list) => {
        console.log('getting requests');
        this.stockTransferList_REQUEST = list;
        this.currentDataList.next(list);
        return list;
      });
    else if(type == StockTransferRequestListType.DRAFT)
      return this._getDraftStockTransferList().map( (list) => {
        console.log('getting drafts');
        this.stockTransferList_DRAFTS = list;
        this.currentDataList.next(list);
        return list;
      });
    else if(type == StockTransferRequestListType.READYFORSHIPMENT)
      return this._getAcceptedStockTransferList().map( (list) => {
        console.log('getting accepted/ ready for shipment');
        this.stockTransferList_ACCEPTED = list;
        this.currentDataList.next(list);
        return list;
      })
  }

  private _AllStockTransferList() : Observable<$StockTransferRequestS1[]> {
    if(this.stockTransferList_ALL)
      return Observable.of(this.stockTransferList_ALL);
    else
      return this._QueryStockTransferRequests(StockTransferRequests_OQL_QUERY.ALL);
  }
  private _getRequestedStockTransferList() : Observable<$StockTransferRequestS1[]> {
    if(this.stockTransferList_REQUEST)
      return Observable.of(this.stockTransferList_REQUEST);
    else
      return this._QueryStockTransferRequests(StockTransferRequests_OQL_QUERY.REQUESTS);
  }

  private _getDraftStockTransferList() : Observable<$StockTransferRequestS1[]> {
    if(this.stockTransferList_DRAFTS)
      return Observable.of(this.stockTransferList_DRAFTS);
    else
      return this._QueryStockTransferRequests(StockTransferRequests_OQL_QUERY.DRAFTS);
  }

  private _getAcceptedStockTransferList() : Observable<$StockTransferRequestS1[]> {
    if(this.stockTransferList_ACCEPTED)
      return Observable.of(this.stockTransferList_ACCEPTED);
    else
      return this._QueryStockTransferRequests(StockTransferRequests_OQL_QUERY.ACCEPTED);
  }

  private _QueryStockTransferRequests(oql : string) : Observable<$StockTransferRequestS1[]> {
    return Observable.fromPromise( this.gtnApi.query(GTNDataTypes.StockTransferRequest , oql ))
      //Return result or empty array to indicate empty result set
      .map( response => ( response.result || [] ) as Array<$StockTransferRequestS1>)
      .catch( this.catchBadRequests )
  }

  private reconcileUpdatedInstance(streamData : InstanceStream) {
    //If new - add to ALL LIST AND DRAFTS LIST
    if(streamData.isNew) {
      this.stockTransferList_ALL.unshift(streamData.instance);
      if(this.stockTransferList_DRAFTS)
        this.stockTransferList_DRAFTS.unshift(streamData.instance);
    } else {
      this.__reconcileQueryList(this.stockTransferList_ALL, streamData);
      this.__reconcileQueryList(this.stockTransferList_DRAFTS,streamData);
      this.__reconcileQueryList(this.stockTransferList_REQUEST,streamData);
      this.__reconcileQueryList(this.stockTransferList_ACCEPTED,streamData);
    }

  }

  private __reconcileQueryList(array,streamData) {
    if(array){
      let i = 0;
      for(i; i < array.length; i++) {
        if( array[i].uid == streamData.instance.uid) {
            //If no workflow state attached, replace
            array[i] = streamData.instance;
        }
      }
    }
  }

  private catchBadRequests(e) {
    console.log('caught in app data handler' + e );
    return Observable.throw(e);
  }

}

