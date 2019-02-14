import {
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  ModalController,
  NavController,
  NavParams, PopoverController
} from 'ionic-angular';
import {ChangeDetectorRef, Component, DoCheck, ElementRef, OnInit, ViewChild} from "@angular/core";
import {RequestInstanceHandler} from "../../services/request-instance-handler";
import {$CommentS1, $StockTransferRequestS1} from "../../interfaces/api";
import {Observable} from "rxjs";
import {STR_Workflow_States} from "../../interfaces/app_constants";
import { PicklistRegistryKeys } from "../../interfaces/picklist";
import { CommentModal } from "./sub-components/comment/comment-modal";
import {AppxCredentialHandler} from "../../services/appx-credential-handler";
import { ActionSetPopover } from "./sub-components/action-bar/action-set-popover";
import { StockTranferInstanceModifiability } from "../../interfaces/app_constants";
import {GoogleMap, GoogleMaps} from "@ionic-native/google-maps";

@Component({
  templateUrl: 'request-instance-page-template.html'
})

export class RequestInstancePage implements DoCheck{
  clientInstance : $StockTransferRequestS1;
  serverInstance : $StockTransferRequestS1;

  isDirtyState : boolean = false;
  disregardChanges : boolean = false;

  editMode : StockTranferInstanceModifiability;

  //Define interfaces to be used in template
  workflowStates = STR_Workflow_States;
  picklistRegistryKeys = PicklistRegistryKeys;
  editModes = StockTranferInstanceModifiability;
  constructor(private stockRequestDataHandler : RequestInstanceHandler,
              private appxCredentials : AppxCredentialHandler,
              private loadingCtrl : LoadingController ,
              private alertCtrl : AlertController ,
              private navCtrl : NavController,
              private pageParams : NavParams,
              private modalCntrl : ModalController,
              private popoverController : PopoverController,
              private changeDetector : ChangeDetectorRef) {}

  ionViewDidLoad() {
    if( this.pageParams.get('uid') ){
      let loading = this.loadingCtrl.create({
        content: 'Fetching Object...'
      });
      //Present loading controller after 1/4 a second
      loading.present();
      console.log('Fetching Object');
      this.stockRequestDataHandler.loadByUid( this.pageParams.get('uid') )
        .subscribe((instanceFromServer : $StockTransferRequestS1) => {
          this.serverInstance = instanceFromServer;
          this.clientInstance = Object.assign({} , instanceFromServer);
          this.setModifiable();
          loading.dismiss();
        }, () => {
          let alert = this.alertCtrl.create({
            title : 'Fail',
            message : 'Failed to load page'
          });
          alert.onDidDismiss( () => {
            this.navCtrl.pop();
          });
          alert.present();
        });
    } else {
      //NEW instance
      this.serverInstance = null;
      //We can pass in init param to this page to initialize a new request
      this.clientInstance = this.stockRequestDataHandler.initInstance( this.pageParams.get('init') );
      this.editMode = StockTranferInstanceModifiability.EDIT_MODE;
    }
  }

  ngDoCheck() {
    this.isDirtyState = JSON.stringify(this.clientInstance) !== JSON.stringify(this.serverInstance);
  }

  ionViewCanLeave() {
    if( this.isDirtyState && ! this.disregardChanges ){
      this.promptToSave();
      return false;
    }
    return true;
  }

  showAddCommentPopover() {
    let commentModal = this.modalCntrl.create(CommentModal);
    commentModal.onDidDismiss(data => {
      let myDate = new Date();
      if(data.comment) {
        let buildComment : $CommentS1 = {
          text : data.comment,
          timestamp : myDate.toDateString() + " @ " + myDate.toTimeString(),
          user : this.appxCredentials.getUserUid()
        };
        if(this.clientInstance.comments)
          this.clientInstance.comments.push(buildComment);
        else
          this.clientInstance.comments = [buildComment];
      }
      //Maybe save here?
    });
    commentModal.present();
  }

  private setModifiable() {
    switch( this.clientInstance.wfState ){
      case STR_Workflow_States.SHIPMENTCONFIRMED:
      case STR_Workflow_States.DENIED:
      case STR_Workflow_States.REQUESTED:
           this.editMode = StockTranferInstanceModifiability.NONE;
           break;
      case STR_Workflow_States.ADJUSTMENT:
          this.editMode = StockTranferInstanceModifiability.ADJUST_MODE;
          break;
      case STR_Workflow_States.ACCEPTED:
          this.editMode = StockTranferInstanceModifiability.ONLY_SHIPMENT;
          break;
      default :
        this.editMode = StockTranferInstanceModifiability.EDIT_MODE;
    }
  }

  executeInstanceSave() : Promise<any>{
    let loading = this.loadingCtrl.create({
      content: 'Saving...'
    });
    loading.present();
    return this.stockRequestDataHandler.save(this.clientInstance).then( instance => {
        this.serverInstance = instance;
        this.clientInstance = Object.assign({} , instance);
        this.isDirtyState = false;
        this.setModifiable();
        loading.dismiss();
      }
    , (e)=> {
      loading.dismiss();
      this.alertCtrl.create({
        title : 'Save Failed',
        message : 'Contact GT Nexus - Save Failure'
      }).present();
    });
  }

  handleTransition(workflowState : string) {
    let loading = this.loadingCtrl.create({
      content: 'Transitioning Object...'
    });
    loading.present();
    return this.stockRequestDataHandler.transitionObject(this.clientInstance, this.isDirtyState, workflowState).then( (savedInstance) => {
      console.log('Transition Success');
      this.serverInstance = savedInstance;
      this.clientInstance = Object.assign({} , savedInstance);
      this.setModifiable();
      loading.dismiss();
    } , (e)=> {
      loading.dismiss();
      this.alertCtrl.create({
        title : 'Transition Failed',
        message : 'Contact GT Nexus - Save Failure'
      }).present();
    });
  }

  promptToSave() {
    let alert = this.alertCtrl.create({
      title: 'Unsaved Data',
      message: 'Do you want to save your changes?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.disregardChanges = true;
            this.navCtrl.pop();
          }
        },
        {
          text: 'Save',
          handler: () => {
            console.log('Buy clicked');
            this.executeInstanceSave().then( () => {
              this.navCtrl.pop();
            })
          }
        }
      ]
    });
    alert.present();
  }

  //ACTIONSET
  public shouldShowActionButton() {
    if(this.clientInstance) {
      return ( this.clientInstance.uid &&
        this.clientInstance.wfState != STR_Workflow_States.DENIED &&
        this.clientInstance.wfState != STR_Workflow_States.SHIPMENTCONFIRMED )
    }
    return false;
  }

  public actionSetButtonOnClick(event) {
    let popover = this.popoverController.create(ActionSetPopover, {
      workflowState : this.clientInstance.wfState
    });
    popover.onDidDismiss( data => {
      if( data )
        this.handleTransition(data.action)
    });
    popover.present({
      ev: event
    });
  }
  /*
      Object
        field - fieldname of the requestInstanceObject
        location - locationName
   */
  public handleMapSelection($event) {
    console.log($event);
    console.log('SET' + $event.field);
    this.clientInstance[$event.field] = $event.location;
    this.changeDetector.detectChanges();
  }

}
