import {AlertController, IonicPage, LoadingController, NavController} from 'ionic-angular';
import { Component , OnInit } from "@angular/core";
import {GtnApiService} from "../../services/gtn-api-service";
import { DashboardPage } from "../dashboard/dashboard-page-component";
import {AppxCredentialHandler} from "../../services/appx-credential-handler";

@Component({
  selector: 'sf-page-login',
  templateUrl: 'login.html'
})
export class LoginPage{
  constructor(private appx : AppxCredentialHandler,
              private loadingCtrl : LoadingController ,
              private alertCtrl : AlertController ,
              private navCtrl : NavController) {

  }

  login(username,password) {
    console.log(username + "/" + password);
    let loading = this.loadingCtrl.create({
      content: 'Signing in...'
    });
    loading.present();
    this.appx.loginFn(username,password)
      .then( () => {
        console.log('outtah');
        loading.dismiss();
        this.navCtrl.setRoot(DashboardPage);
      }, () => {
          loading.dismiss();
          this.alertCtrl.create({
            title : 'Error',
            message : 'Login Failed!'
          }).present();
      })
  }
}
