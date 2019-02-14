import { Component } from '@angular/core';
import {LoadingController, NavController,} from 'ionic-angular';
import { DashboardListComponent } from "./dashboard-list-component/dashboard-list-component";
import { DashboardMapComponent } from "./dashboard-map-component/dashboard-map-component";
import {AppDataHandler} from "../../services/app-data-handler";
import {$StockTransferRequestS1} from "../../interfaces/api";
import {StockTransferRequestListType} from "../../interfaces/app_constants";
import {Observable} from "rxjs";
import {InitAppDataService} from "../../services/init-app-data-load";

@Component({
  selector : 'dashboard-component',
  templateUrl: './dashboard-template.html'
})
export class DashboardPage {
  tab1 = DashboardListComponent;
  tab2 = DashboardMapComponent;
  currentActiveList = StockTransferRequestListType.ALL;
  listTypes = StockTransferRequestListType;

  constructor(public navCtrl: NavController, private appDataHandler : AppDataHandler, private loadingCtrl : LoadingController,
              private initDataService : InitAppDataService) {

  }

  ionViewDidLoad() {
    console.log("I'm alive!");
    //this.fetchTypeOfList();
    let loading = this.loadingCtrl.create({
      content: 'Loading From Api...'
    });
    loading.present();
    this.initDataService.initialDataFetch().then(function(){
      loading.dismiss();
    },() => {
      loading.dismiss();
    })
  }

  ionViewWillEnter() {
    console.log('Ion View Will ENTER');
    //Fetch up to date active list
    this.fetchTypeOfList();
  }

  fetchListOnClick(listType : StockTransferRequestListType) : void {
    console.log('FETHING' + listType );
    this.currentActiveList = listType;
    this.fetchTypeOfList();
  }

  fetchTypeOfList() {
    let loading = this.loadingCtrl.create({
      content: 'Loading From Api...'
    });
    //Present loading controller after 1/4 a second
    let timeout = setTimeout( () => {
      loading.present();
    } , 250 );
    this.appDataHandler.getStockTransferList(this.currentActiveList)
      .catch( (e) => {
        console.log('in error here ' + e);
        return Observable.throw(e);
      })
      .subscribe((queryList: $StockTransferRequestS1[]) => {
        if(queryList){
          console.log('Query length ' + queryList.length);
        }
        clearTimeout(timeout);
        loading.dismiss();
      }, (e) => {
        console.log('Errah');
      });
  }

  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
  }

}
