import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from "./components/login/login.component";
import { RequestInstancePage } from "./components/str-component/request-instance-page";
import { DashboardMapComponent } from "./components/dashboard/dashboard-map-component/dashboard-map-component";
import { DashboardListComponent } from "./components/dashboard/dashboard-list-component/dashboard-list-component";
import { DashboardPage } from "./components/dashboard/dashboard-page-component";
import { GtnApiService} from "./services/gtn-api-service";
import { AppDataHandler } from "./services/app-data-handler";
import { AppxCredentialHandler } from "./services/appx-credential-handler";
import { PicklistRegistryService } from "./services/picklist-registry";
import { GtnLocationService } from "./services/gtn-location-service";
import { InitAppDataService } from "./services/init-app-data-load";
import { GoogleMaps, Environment} from "@ionic-native/google-maps";
import {RequestInstanceHandler} from "./services/request-instance-handler";

import { PicklistFieldDirective } from "./common/picklist-field/picklist-field-directive";
import { CommentModal } from "./components/str-component/sub-components/comment/comment-modal";
import { ActionSetPopover } from "./components/str-component/sub-components/action-bar/action-set-popover";
import { RequestInstanceMap } from "./components/str-component/sub-components/instance-map/instance-map-component";
import { ReauthPopover } from "./components/login/reauth/Reauth-popover-component";


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    DashboardMapComponent, DashboardListComponent, DashboardPage, RequestInstancePage,
    PicklistFieldDirective,CommentModal,ActionSetPopover,ReauthPopover,RequestInstanceMap
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    DashboardMapComponent, DashboardListComponent, DashboardPage, RequestInstancePage,
    CommentModal,ActionSetPopover,ReauthPopover
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GoogleMaps,
    GtnApiService, AppDataHandler, RequestInstanceHandler, AppxCredentialHandler,PicklistRegistryService,GtnLocationService,InitAppDataService
    /*GoogleMaps,Environment -- works with this, not sure if necessary for cordova app*/
  ]
})
export class AppModule {}
