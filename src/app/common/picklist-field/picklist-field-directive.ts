import {
  ChangeDetectorRef,
  Component,
  DoCheck, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  TemplateRef, ViewChild,
  ViewContainerRef
} from "@angular/core";
import {PicklistRegistryService} from "../../services/picklist-registry";
import {PicklistRegistryKeys, Picklist} from "../../interfaces/picklist";

@Component({
  selector: 'picklist-field',
  templateUrl: './picklist-field-template.html'
})
export class PicklistFieldDirective implements OnInit, OnChanges{
  @Input() readonly : boolean;
  @Input() picklistType : PicklistRegistryKeys;

  @Input() value : string;
  @Output() valueChange = new EventEmitter();

  picklistLabel : string = '';
  @ViewChild('selectElement') selectElement : HTMLSelectElement;

  picklist : Picklist;
  constructor(private registry : PicklistRegistryService ,
              private viewContainer: ViewContainerRef,
              private changeDetector : ChangeDetectorRef) {
  }
  ngOnInit() {
    this.picklist = this.registry.getPicklist(this.picklistType);
  }

  ngOnChanges(sc : SimpleChanges) {
    console.log('picklist change');
    if(sc.value && (sc.value.previousValue != sc.value.currentValue)){
      this.picklistLabel = this.registry.getLabel(this.picklistType, sc.value.currentValue);
      if(this.selectElement){
        //  Works
        //this.selectElement._value = sc.value.currentValue;
        //this.selectElement._updateText();
        this.selectElement.writeValue(sc.value.currentValue);
      }
    }
  }

  emitValue() {
    this.valueChange.emit(this.value);
  }

}
