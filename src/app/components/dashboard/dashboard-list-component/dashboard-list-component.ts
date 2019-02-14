import { Component } from '@angular/core';
import { NavController , App } from 'ionic-angular';
import {$StockTransferRequestS1} from "../../../interfaces/api";
import {AppDataHandler} from "../../../services/app-data-handler";
import {RequestInstancePage} from "../../str-component/request-instance-page";

@Component({
  selector: 'dashboard-list',
  templateUrl: './dashboard-list-template.html'
})
export class DashboardListComponent {

  displayList : Array<$StockTransferRequestS1>;
  constructor(public navCtrl: NavController, private appDataService : AppDataHandler, private appController : App ) {
    this.appDataService.currentListObserver()
      .subscribe( (list : Array<$StockTransferRequestS1>) => {
        console.log('SET LSIT IN LIST SCREEN');
        this.displayList = list;
      })
  }

  popNewRequestInstance(){
    //this.navCtrl.push(RequestInstancePage);
    this.appController.getRootNav().push(RequestInstancePage);
  }

  listItemClickFn(listItem : $StockTransferRequestS1) {
    this.appController.getRootNav().push(RequestInstancePage, {
      uid : listItem.uid
    })
  }

}
