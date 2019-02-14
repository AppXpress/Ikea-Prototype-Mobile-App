import { Injectable } from '@angular/core';
import env from "../../environments/environment";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {ReauthPopover} from "../components/login/reauth/Reauth-popover-component";
import {AlertController, LoadingController, ModalController, ToastController} from "ionic-angular";

//Not used yet

@Injectable()
export class AppxCredentialHandler {

  orgId : string = env.ikeaOrgId;
  userId : string = "1074081479";
  name : string = "Andrew R";
  login : string = "andrew@ikea";

  reauthenticateIsOpen : boolean = false;
  //TESTING
  private authToken = env.auth;//'faketoken'; //= env.auth;

  constructor(private http : HttpClient,
              private alertController : AlertController,
              private loadingController : LoadingController,
              private toastCtrl : ToastController) {
    console.log('appx');
  }

  public loginFn(username : string , pw : string) : Promise<any> {
    return this.http.get( env.url + "/User/self", {
      headers : {
        'datakey' : env.datakey,
        'Authorization' : this.authenticate(username,pw)
      },
      observe : 'response'
    })
      .toPromise()
      .then((response : HttpResponse<any>) => {
        console.log(response);
        this.setUser( response.body );
        this.orgId = response.body.organizationUid;
        if(response.headers.get('Authorization'))
          this.authToken = response.headers.get('Authorization');
        else
          console.warn('Response authorization was not set' );
        return response;
      });
  }

  public getToken() {
    console.log('TOKEN' + this.authToken);
    return this.authToken;
  }

  public setToken(token : string) {
    this.authToken = token;
  }

  public reauthicate() {
    if( ! this.reauthenticateIsOpen ){
      this.reauthenticateIsOpen = true;
      let alert = this.alertController.create({
        cssClass : 'alert-center',
        subTitle : 'Reauthetication Required',
        enableBackdropDismiss : false,
        inputs : [{
          name: 'password',
          type : 'password',
          placeholder : 'Enter Password'
        }],
        buttons : [{
          text : 'Reauthenticate',
          handler : (data) => {
            let load = this.loadingController.create();
            load.present();
            this.loginFn( this.getLogin() , data.password )
              .then( (success) => {
                load.dismiss().then( () => {
                  alert.dismiss();
                  const toast = this.toastCtrl.create({
                    message: 'Successful Reauthentication',
                    duration: 3000
                  });
                  toast.present();
                });
                this.reauthenticateIsOpen = false;
              }, fail => {
                load.dismiss();
                const toast = this.toastCtrl.create({
                  message: 'Authentication Failed',
                  duration: 3000
                });
                toast.present();
              });
            console.log(data);
            return false;
          }
        }]
      });
      alert.present();
    }
  }

  private reauthicateButtonHandler() {

  }

  setUser(userJsonResponse : any) : void {
    this.orgId = userJsonResponse.organizationUid;
    this.userId = userJsonResponse.numericUid;
    this.name = userJsonResponse.name;
    this.login = userJsonResponse.login;
    this.saveToLocalStorage();
  }

  getUserUid() : string{
    return this.userId;
  }

  getLogin() { return this.login; }
  getOrgId() : string {
    return this.orgId;
  }




  private saveToLocalStorage() {
    localStorage.setItem('orgId' , this.orgId);
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('name' , this.name);
    localStorage.setItem('login', this.login);
  }

  private authenticate(user : string ,pw : string){
    var str = user + ":" + pw;
    var b64 = btoa(str);
    return 'Basic ' + b64;
  }

}
