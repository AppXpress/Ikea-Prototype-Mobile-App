import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {GoogleMap, GoogleMaps, GoogleMapsEvent, GroundOverlayOptions, ILatLng, Marker} from "@ionic-native/google-maps";
import {$StockTransferRequestS1} from "../../../../interfaces/api";
import {GtnLocationService} from "../../../../services/gtn-location-service";
import {StockTranferInstanceModifiability} from "../../../../interfaces/app_constants";
import {PicklistRegistryService} from "../../../../services/picklist-registry";

@Component({
  selector: 'request-instance-map',
  templateUrl: 'instance-map-template.html'
})
export class RequestInstanceMap implements OnChanges,AfterContentInit{

  @Input('instance') instance : $StockTransferRequestS1;
  @Output('emitSelection') mySelectionEmitter = new EventEmitter();

  @ViewChild('map') mapEl : ElementRef;
  map : GoogleMap;

  markers : Array<Marker> = [];

  private _pageEditMode : StockTranferInstanceModifiability;
  @Input()
  set pageEditMode(editMode: StockTranferInstanceModifiability){
    //only do this after page is initialized
    this._pageEditMode = editMode;
    if(this.map)
      this.rewriteMap(editMode);
  };
  get pageEditMode(){
    return this._pageEditMode;
  }

  constructor(private locationService : GtnLocationService, private picklistRegistry : PicklistRegistryService) { }

  ngOnChanges(change : SimpleChanges) {
    console.log('do change');
    console.log(change);
  }

  ngAfterContentInit() {
    console.log('ion view did enter in instance');
    setTimeout(() => {
      let mapOptions = {
        camera: {
          target: {
            lat : 59.32,
            lng : 18.06
          },
          zoom: 6
        },
        controls : {
          mapToolbar : false
        }
      };
      this.map = GoogleMaps.create(this.mapEl.nativeElement, mapOptions);
      this.rewriteMap( this.pageEditMode );
    }, 150)
  }

  rewriteMap(mode : StockTranferInstanceModifiability) {
    console.log('Rewrite the mode is ' + mode );
    switch(mode) {
      case StockTranferInstanceModifiability.EDIT_MODE :
        //show all markers in editable state
        console.log('SEt markers');
        if( this.instance.requestedByLocation && this.instance.requestedFromLocation )
          this.setInstanceRouteMarkers();
        else
          this.setMarkers();
        break;
      default:
        console.log('set instance markers');
        this.setInstanceRouteMarkers();
    }

  }

  setMarkers() {
    for( let location of this.locationService.getLocations() ) {
      console.log('adding' + location);
      this.map.addMarker({
        position : <ILatLng> { lat : parseFloat(location.latitude) , lng : parseFloat(location.longitude) },
        title : location.longName
      }).then( (thisMarker) => {
        //Hold marker in array
        this.markers.push(thisMarker);
        thisMarker.setSnippet('Quantity Available : 5');
        thisMarker.on(GoogleMapsEvent.INFO_CLICK).subscribe( () => {
          console.log( this.setSelectionField() );
          this.mySelectionEmitter.next({
            location : location.longName,
            field : this.setSelectionField()
          });
          thisMarker.setIcon('yellow');
        });
        thisMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe( ()=>{
          thisMarker.setSnippet(this.setSelectionSnippet());
        })
      })
    }
  }
  /*

   */
  setInstanceRouteMarkers() {
    //clear markerArray
    this.markers.forEach( marker => marker.remove() );

    let destination = this.locationService.getLocation(this.instance.requestedByLocation);
    let source = this.locationService.getLocation(this.instance.requestedFromLocation);
    if(destination && source ) {
      this.map.addMarker({
        position : <ILatLng> { lat : parseFloat(destination.latitude) , lng : parseFloat(destination.longitude) },
        title : destination.longName,
        snippet : 'Requested By Location',
        color : 'yellow'
      });
      this.map.addMarker({
        position : <ILatLng> { lat : parseFloat(source.latitude) , lng : parseFloat(source.longitude) },
        title : source.longName,
        snippet : 'Requested From Location',
        color : 'yellow'
      });
      this.map.addPolyline({
        points : [
          <ILatLng> { lat : parseFloat(destination.latitude) , lng : parseFloat(destination.longitude) },
          <ILatLng> { lat : parseFloat(source.latitude) , lng : parseFloat(source.longitude) }
        ],
        color : 'red',
        width : 5,
        icons: [{
          icon: {path: 'FOWARD_CLOSED_ARROW' },
          offset: '100%',
          repeat: '20px'
        }]
      });
      this.map.moveCamera({ target : { lat : parseFloat(destination.latitude) , lng : parseFloat(destination.longitude) } });
    } else {
      console.log('Undefined dest or source');
      console.log(this.instance.requestedByLocation);
      console.log(this.instance.requestedFromLocation);
    }
  }


  /*
      The selection of a location with set either the requestedByLocation or requestedFromLocation field
   */
  private setSelectionField() {
    if( this.instance.requestedByLocation )
      return 'requestedFromLocation';
    else
      return 'requestedByLocation';
  }

  private setSelectionSnippet() {
    if( this.instance.requestedByLocation )
      return 'Set Request From Location';
    else
      return 'Set Request By Location';
  }
}
