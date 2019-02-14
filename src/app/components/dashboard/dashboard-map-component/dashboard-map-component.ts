import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Renderer2, ViewChild} from '@angular/core';
import {App, NavController} from 'ionic-angular';
import {
  GoogleMap,
  GoogleMaps,
  Environment,
  CameraPosition,
  ILatLng,
  HtmlInfoWindow,
  GoogleMapsEvent
} from "@ionic-native/google-maps";
import {$StockTransferRequestS1} from "../../../interfaces/api";
import {AppDataHandler} from "../../../services/app-data-handler";
import {GtnLocationService} from "../../../services/gtn-location-service";
import {GtnLocation} from "../../../interfaces/Location";
import {RequestInstancePage} from "../../str-component/request-instance-page";

@Component({
  selector: 'dashboard-map',
  templateUrl: './dashboard-map-template.html'
})
export class DashboardMapComponent {

  @ViewChild('map') mapElement: ElementRef;
  map : GoogleMap;

  currentList : Array<$StockTransferRequestS1>;

  currentSelectedLocation : GtnLocation;
  currentMarkerSelectedList : Array<$StockTransferRequestS1>;
  constructor(public navCtrl: NavController, private appDataService : AppDataHandler,
              private locationService : GtnLocationService,
              private appController : App,
              private cd : ChangeDetectorRef) {
    this.appDataService.currentListObserver()
      .asObservable()
      .subscribe( (list : Array<$StockTransferRequestS1>) => {
        this.currentList = list;
      });
    this.currentList = this.appDataService.currentListObserver().getValue();
  }

  ionViewDidLoad(){
    console.log('load map');
    // This code is necessary for browser
    let mapOptions = {
      camera: {
        target: {
          lat : 59.32,
          lng : 18.06
        },
        zoom: 8
      },
      controls : {
        mapToolbar : false
      }
    };
    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);
    this.setMarkers();
  }


  setMarkers() {
    let infoWindow = new HtmlInfoWindow();
    for( let location of this.locationService.getLocations() ) {
      console.log('adding' + location);
      let infoWindowContent = '<p>' + location.longName + '</p>';
      this.map.addMarker({
        position : <ILatLng> { lat : parseFloat(location.latitude) , lng : parseFloat(location.longitude) }
      }).then( (thisMarker) => {
        thisMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe( () => {
          infoWindow.setContent(infoWindowContent);
          infoWindow.open(thisMarker);
          console.log('locatio hit');
          this.setSelectedItem( location );
        })
      })
    }
  }
  //Todo elevate this up to the parent
  listItemClickFn(str : $StockTransferRequestS1) {
    this.appController.getRootNav().push(RequestInstancePage, {
      uid : str.uid
    })
  }

  newRequestOnClickFn() {
    let newStockRequest : $StockTransferRequestS1 = {} as $StockTransferRequestS1;
    newStockRequest.requestedFromLocation = this.currentSelectedLocation.longName;
    this.appController.getRootNav().push(RequestInstancePage, {
      init : newStockRequest
    });
  }

  setSelectedItem(location : GtnLocation) {
    console.log(location);
    this.currentSelectedLocation = location;
    this.currentMarkerSelectedList = this.currentList.filter( (stockTransferObj) => {
      return stockTransferObj.requestedByLocation == location.longName ||
             stockTransferObj.requestedFromLocation == location.longName;
    });
    this.cd.detectChanges();
  }

  moveCamera() {
    let target = <ILatLng> { lat: 42.2626, lng: -71.8023 };
    console.log('move cam');
    this.map.moveCamera({ target : target });
  }

  private findLatLngFromLocationKey(key) : ILatLng {
    for(let loc of this.locationService.getLocations()) {
      if( loc.longName == key ) {
        return { lat : parseFloat(loc.latitude) , lng : parseFloat(loc.longitude) } as ILatLng;
      }
    }
  }
}
