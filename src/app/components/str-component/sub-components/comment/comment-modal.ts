import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";

@Component({
  templateUrl : 'comment-modal-template.html'
})
export class CommentModal {
  comment : string;

  constructor(public viewCtrl: ViewController) {

  }

  dismiss() {
    this.viewCtrl.dismiss({
      comment : this.comment
    });
  }

}
