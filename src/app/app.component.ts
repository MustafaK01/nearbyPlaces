import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NearByPlace } from './model/NearbyPlace.model';
import { MapOptions } from './model/Options.model';
import { SpinnerService } from './services/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  latitude = 0;
  longitude = 0;
  radius = 1500; 
  circleUpdated = false;
  searchedInRadius = false;

  nearByPlaces: NearByPlace[] = [];
  healthCenters:NearByPlace[] = [];
  restaurants:NearByPlace[] = [];
  stores:NearByPlace[] = [];
  atms:NearByPlace[] = [];
  duplicateNearbyPlaces:NearByPlace[] = []; 

  center: google.maps.LatLngLiteral = { lat: 41, lng: 35 };
  mapOptions: MapOptions;

  constructor(private http: HttpClient,private spinnerService:SpinnerService, private toastr: ToastrService) {
    this.mapOptions = new MapOptions();
   }

  ngOnInit(): void {
    this.nearByPlaces.forEach(element=>{
      this.duplicateNearbyPlaces.push(element);
    });
    }

  circleOptions = {
    strokeColor: 'blue',
    fillColor: 'gray',
    radius: this.radius
  };

  updateRadius() {
    this.circleOptions.radius = Number(this.radius);
    this.circleUpdated = !this.circleUpdated;
  }

  selectMarker(place: NearByPlace) {
    this.nearByPlaces.forEach((p) => {
      if (p !== place) {
        p.selected = false;
      }
    });
    place.selected = !place.selected;  }

  selectLocation(event: google.maps.MapMouseEvent) {
    if(this.latitude!=0 && this.longitude!=0){ 
      this.clearMap();
    }
    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();
  }

  filterPlaces(place){
    this.filterHealthCenters(place);
    this.filterRestaurants(place);
    this.filterStores(place);
    this.filterAtms(place);
  }

  showPlaces(placeType) {
    this.spinnerService.requestStarted();
    const placesMap = {
      'atms': this.atms,
      'healthCenters': this.healthCenters,
      'restaurants': this.restaurants,
      'stores': this.stores
    };
    setTimeout(() => {
      this.spinnerService.requestEnded();
      this.nearByPlaces = placesMap[placeType] || [];
    }, 750);
  }


  searchByLatLngAndRadius(){
    this.nearByPlaces = [];
    if(this.checkInputs()){ 
      this.toastr.error('Please provide latitude and longitude', 'ERROR');
      return;
    }
    this.spinnerService.requestStarted();
    this.http.get('http://localhost:8070/api/location-service/getNearbyPlaces?latitude='+this.latitude
    +'&longitude='+this.longitude+'&radius='+this.radius).subscribe((response:any) => {
      console.log(response.nearbyPlaces);
      response.nearbyPlaces.forEach(element => {
        let distance = this.calculateDistance(this.latitude,this.longitude,element.latitude,element.longitude).toFixed(0);
        let place = new NearByPlace(element.latitude,element.longitude
          ,element.name,element.rating,element.types,element.vicinity
          ,distance);
          if(this.checkLocationDistance(place.latitude,place.longitude)) {
            this.nearByPlaces.push(place);          
            this.filterPlaces(place);
          }
      },  this.spinnerService.requestEnded(),
      );
    }, (error) => {
      console.error(error);
    });
    this.searchedInRadius = true;
  }

  clearMap(){
    if(this.checkInputs()){ 
      this.toastr.error('Please provide latitude and longitude', 'ERROR');
      return;
    }
    this.spinnerService.requestStarted();;
    this.nearByPlaces = [];
    this.atms = [];
    this.healthCenters = [];
    this.stores = [];
    this.restaurants = []
    this.searchedInRadius = false;
    this.latitude = 0;
    this.longitude = 0;
    setTimeout(() => {
      this.spinnerService.requestEnded();
    }, 1000)
  }

  //The control is also performed on the backend side, but just in case, 
  //i wanted to check here as well to ensure accurate results. 
  //Anyone who wants to test whether the backend is functioning or not, can remove the 
  //'if' block under the subscribe function and try.
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371;
    const degToRad = Math.PI / 180;

    const lat1Rad = lat1 * degToRad;
    const lon1Rad = lon1 * degToRad;
    const lat2Rad = lat2 * degToRad;
    const lon2Rad = lon2 * degToRad;
  
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c * 1000;
  
    return distance;
  }

  filterPlace(place,keywords,arr){
    for (let i = 0; i < place.types.length; i++) {
      for (let j = 0; j < keywords.length; j++) {
        if(place.types[i]===keywords[j]){
          arr.push(place);
          i=place.types.length;
        }         
      }
    }
  }
  
  filterHealthCenters(place){
    let healthCenterKeyWords = ["hospital","doctor","health"]
    this.filterPlace(place,healthCenterKeyWords,this.healthCenters);
  }

  filterRestaurants(place){
    let restaurantKeywords = ["restaurant","bar","cafe","food","meal_takeaway","meal_delivery"];
    this.filterPlace(place,restaurantKeywords,this.restaurants);  
  }

  filterStores(place){
    let supermarketKeywords = ["supermarket","store","shoe_store"
    ,"clothing_store","electronics_store","home_goods_store","jewelry_store"];
    this.filterPlace(place,supermarketKeywords,this.stores);  
  }

  filterAtms(place){
    let atmKeywords = ["atm","finance","bank"];
    this.filterPlace(place,atmKeywords,this.atms);  
  }

  checkInputs(){
    return this.latitude == 0 && this.longitude == 0 || this.radius==0;
  }

  checkLocationDistance(latitude,longitude){
    return this.calculateDistance(this.latitude,this.longitude,latitude,longitude) < this.radius;
  }

}
