import {Component} from "@angular/core";
import {LoadingController, ViewController} from "ionic-angular";
import {GtnApiService} from "../../../services/gtn-api-service";
import {AppxCredentialHandler} from "../../../services/appx-credential-handler";


//CANNOT REFERENCE GTNAPI - uses appxCredential handler to handle / login request
@Component({
  template: '<ion-content>' +
    '<ion-title>Token Expired - Please Reauthenticate</ion-title><ion-item>' +
    '<ion-label stacked>Password</ion-label>'+
    '<ion-input type="password" [(ngModel)]="password" ></ion-input>'+
    '<button ion-button (click)="reauthClick()">Reauthenticate</button>'+
    '</ion-item>'+
    '<p style="color:red" *ngIf="shouldShowErrorMsg">Login Failed!</p></ion-content>'
})
export class ReauthPopover{
  password : string;
  shouldShowErrorMsg : boolean = false;
  appxCredentialHandler : any;
  constructor(private viewController : ViewController,
              private loadingCtrl : LoadingController) {
  }

  reauthClick() {
    let loading = this.loadingCtrl.create({
      content: 'Signing in...'
    });
    loading.present();

    /*
    this.apiService.login(this.appxCredentials.getLogin(),this.password)
      .then( () => {
        console.log('Success');
        loading.dismiss();
        debugger;
        this.viewController.dismiss();
      }, () => {
        loading.dismiss();
        this.showErrorMsg();
      })*/
  }

  showErrorMsg() {
    this.shouldShowErrorMsg = true;
    setTimeout( () => {
      if(this)
        this.shouldShowErrorMsg = false;
    }, 2000 );
  }

}
