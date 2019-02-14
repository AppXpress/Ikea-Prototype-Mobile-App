import {Component, EventEmitter, Input, OnChanges, Output, ViewChild} from "@angular/core";
import {$StockTransferRequestS1} from "../../../../interfaces/api";
import {STR_Workflow_Actions} from "../../../../interfaces/app_constants";
import {NavParams, PopoverController, ViewController} from "ionic-angular";

const $StockTransferRequestS1WorkflowMap = {
  'InitializeRequest' : [
    {
      label : 'Request',
      action : STR_Workflow_Actions.REQUEST,
      color : 'default'
    }
  ],
  'Requested' : [
    {
      label : 'Accept',
      action : STR_Workflow_Actions.ACCEPT,
      color : 'secondary'
    },
    {
      label : 'Adjust',
      action : STR_Workflow_Actions.ADJUST,
      color : 'dark'
    },
    {
      label : 'Deny',
      action : STR_Workflow_Actions.DENY,
      color : 'danger'
    }
  ],
  'Adjustment' : [
    {
      label : 'Submit',
      action : STR_Workflow_Actions.SUBMITADJUSTMENT,
      color : 'secondary'
    },
    {
      label : 'Deny',
      action : STR_Workflow_Actions.DENY,
      color : 'danger'
    }
  ],
  'RequestAccepted' : [
    {
      label : 'Confirm Shipped',
      action : STR_Workflow_Actions.CONFIRM,
      color : 'secondary'
    }
  ],
  'ShipmentConfirmed' : [],
  'RequestDenied' : []
};

@Component({
  template: `
    <ion-list>
      <button *ngFor="let actionNode of actionSet" ion-item (click)="emitTransition(actionNode.action)">{{actionNode.label}}</button>
    </ion-list>
  `
})
export class ActionSetPopover {
  actionSet : Array<any> = [];
  constructor(public viewCtrl: ViewController, private navParams : NavParams) {
    let workflowState = navParams.get('workflowState');
    this.actionSet = $StockTransferRequestS1WorkflowMap[ workflowState ];
    console.log(this.actionSet);
  }
  emitTransition(action) {
    this.viewCtrl.dismiss({
      action : action
    })
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
