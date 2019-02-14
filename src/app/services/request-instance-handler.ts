/*
  Handle Request Instances within the App
  Including
    Create New
    Load
    Save
 */

import {Injectable} from "@angular/core";
import {GtnApiService} from "./gtn-api-service";
import {$StockTransferRequestS1} from "../interfaces/api";
import {BehaviorSubject, Observable} from "rxjs";
import {GTNDataTypes} from "../interfaces/app_constants";
import {AppxCredentialHandler} from "./appx-credential-handler";
import {InstanceStream} from "../interfaces/app_streams";

@Injectable()
export class RequestInstanceHandler {

  requestInstanceMap : Map<string,$StockTransferRequestS1> = new Map();

  private instanceUpdateStream : BehaviorSubject<InstanceStream> = new BehaviorSubject({} as InstanceStream);

  constructor(private gtnapi : GtnApiService, private user : AppxCredentialHandler) {}

  public getInstanceStream() {
    return this.instanceUpdateStream;
  }

  public initInstance( initialize ?: $StockTransferRequestS1 ) : $StockTransferRequestS1{
    let newInstance = {
      requestedByUser: this.user.getUserUid(),
      licensee: {
        memberId: this.user.getOrgId()
      }
    };
    if(initialize) {
      newInstance = Object.assign(initialize,newInstance);
    }
    return newInstance as $StockTransferRequestS1;
  };

  public loadByUid(uid : string) : Observable<$StockTransferRequestS1>{
    if( this.requestInstanceMap.get(uid) )
      return Observable.of(this.requestInstanceMap.get(uid));
    else
      return Observable.fromPromise( this.gtnapi.fetchInstance(GTNDataTypes.StockTransferRequest , uid ) )
        .map( (instance : $StockTransferRequestS1) => {
          this.requestInstanceMap.set(uid , instance );
          return instance;
        });
  }

  public save(instance : $StockTransferRequestS1) : Promise<any> {
    if(instance.uid)
      return this.gtnapi.saveInstance(GTNDataTypes.StockTransferRequest , instance)
        .then( (newData) => {
          this.requestInstanceMap.set( instance.uid, newData);
          this.instanceUpdateStream.next({
            isNew : false,
            instance : newData
          });
          return newData;
        });
    else{
      console.log('Create Instance');
      //NEW Instance
      return this.gtnapi.createInstance(GTNDataTypes.StockTransferRequest, instance)
        .then( (newData) => {
          console.log('On Create');
          this.requestInstanceMap.set( newData.uid, newData);
          this.instanceUpdateStream.next({
            isNew : true,
            instance : newData
          });
          return newData;
        })
    }
  }

  public transitionObject(instance : $StockTransferRequestS1, preSave : boolean, workflowState : string) : Promise<$StockTransferRequestS1> {
    if(preSave){
      console.log('presave');
      return this.save(instance).then((instance) => {
        return this.transition(instance,workflowState);
      })
    }else
      return this.transition(instance,workflowState);
  }

  private transition(instance: $StockTransferRequestS1, wkState : string) : Promise<$StockTransferRequestS1> {
    return this.gtnapi.transitionInstance(GTNDataTypes.StockTransferRequest, wkState, instance)
      .then( (transitionedObject) => {
        console.log('transition');
        this.requestInstanceMap.set(instance.uid, transitionedObject);
        this.instanceUpdateStream.next({
          isNew : false,
          instance : transitionedObject
        });
        return transitionedObject;
      });
  }
}
