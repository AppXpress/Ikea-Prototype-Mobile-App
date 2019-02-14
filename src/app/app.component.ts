import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from './components/login/login.component';
import { DashboardPage } from "./components/dashboard/dashboard-page-component";
import {PicklistRegistryService} from "./services/picklist-registry";

const testing = false;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  //rootPage:any = LoginPage;
  //rootPage:any = DashboardPage;
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    if(testing) {
      this.rootPage = DashboardPage
    } else{
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

