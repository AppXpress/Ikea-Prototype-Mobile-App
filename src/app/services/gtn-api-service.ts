import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import env from '../../environments/environment';
import {GtnCustomObject, GTNQueryResponse} from "../interfaces/api";
import {AppxCredentialHandler} from "./appx-credential-handler";
import {ModalController} from "ionic-angular";
import {ReauthPopover} from "../components/login/reauth/Reauth-popover-component";
@Injectable()
export class GtnApiService {
  //prod
  //  private authToken : string;
  //test
  private orgId : string;

  constructor(private http: HttpClient, private appxCredentialHandler : AppxCredentialHandler,private modalController : ModalController) {
    console.log('api construction ON' + env.url );
  }

  public fetchInstance(object:string, uid : string) : Promise<any> {
    return this.get(object + "/" + uid )
      .then( response => response.body as GtnCustomObject );
  }

  public query(object : string, oql ?: string) : Promise<any> {
    if( ! oql ) oql = "1=1";
    return this.get(object + "/query?oql=" + oql )
      .then( response => response.body as GTNQueryResponse )
  }


  public saveInstance(object : string, body : GtnCustomObject) : Promise<any>{
    return this.update(object + "/" + body.__metadata.uid, body.__metadata.fingerprint, body)
      .then( (responseJson : any) => {
        return responseJson.data;
      })
  }

  public createInstance(object : string, body : GtnCustomObject) : Promise<any> {
    return this.post(object, {} , body )
      .then( (responseJson : any) => {
        return responseJson.create.result;
      })
  }

  public transitionInstance(object : string ,workflowstep : string, gtnobject : GtnCustomObject ) : Promise<any> {
      let buildWorkflowUrl = [object , gtnobject.uid , 'actionset' , workflowstep].join('/');
      return this.update(buildWorkflowUrl, gtnobject.__metadata.fingerprint, {} as GtnCustomObject)
        .then( (responseJson : any ) => {
            return this.poll(object, gtnobject.uid, responseJson.transition.futureId);
        })
  }

  public pipeline(requests : Array<string>) : Promise<any>{
    return this.post('pipeline' , {} , {
      uri : requests
    }).then(function(response){
      return response.result;
    })
  }

  /////////////////////////////////////////////////////////////////////////
  private get(uri : string) : Promise<any>{
    return this.http.get( env.url + "/" + uri , {
      headers : {
        'datakey' : env.datakey,
        'Authorization' : this.appxCredentialHandler.getToken()
      },
      observe : 'response'
    })
      .toPromise()
      .then((response : HttpResponse<any>) => {
        console.log(response);
        if(response.headers.get('Authorization'))
          this.appxCredentialHandler.setToken( response.headers.get('Authorization') );
        else
          console.warn('Response authorization was not set' );
        return response;
      })
      .catch(this.handleError.bind(this));
  }

  private poll(object : string, uid : string, resourceId : string) : Promise<GtnCustomObject> {
    let buildUri = [object,uid,'poll'].join('/') + "?resourceid=" + resourceId;
    return this.get(buildUri).then( (response : HttpResponse<any>) => {
      let body = response.body;
      if(body.poll) {
        console.log('Poll again');
        return this.poll(object, uid, body.poll.futureId);
      }else{
        return body.data as GtnCustomObject;
      }
    })
  }
  /////////////////////////////////////////////////////////////////////////
  private update(uri : string, fingerprint : string, body : GtnCustomObject) : Promise<any>{
    console.log('Attempt to Persist');
    return this.post(uri, { 'If-Match' : fingerprint } , body );
  }

  private post(uri : string , headers : any, body : any) : Promise<any>{
    headers.datakey = env.datakey;
    headers.Authorization = this.appxCredentialHandler.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.post(env.url + "/" + uri , body , {
      headers : headers
    }).toPromise()
      .catch( this.handleError.bind(this) );
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    if( error.status == 401 ) {
      /*
      let reLoginModal = this.modalController.create(
        ReauthPopover,
        {},
        { enableBackdropDismiss: false }
      );
      reLoginModal.present();*/
      this.appxCredentialHandler.reauthicate();
      return Promise.reject(null);
    } else
      return Promise.reject(error.message || error);
  }
}
