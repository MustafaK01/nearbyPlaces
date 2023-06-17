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

  nearByPlaces: NearByPlace[] = [];
  healthCenters:NearByPlace[] = [];
  restaurants:NearByPlace[] = [];
  superMarkets:NearByPlace[] = [];
  atms:NearByPlace[] = [];

  showAll = true;

  selectedShowAtms = false;
  selectedShowSuperMarkets=false;
  selectedShowHealthCenters=false;
  selectedShowRestaurants=false;

  center: google.maps.LatLngLiteral = { lat: 49, lng: 12 };
  mapOptions: MapOptions;

  constructor(private http: HttpClient,private spinnerService:SpinnerService, private toastr: ToastrService) {
    this.mapOptions = new MapOptions();
   }

  ngOnInit(): void {  }

  circleOptions = {
    strokeColor: 'blue',
    fillColor: 'gray',
    radius: this.radius
  };

  updateRadius() {
    this.circleOptions.radius = Number(this.radius);
    this.circleUpdated = !this.circleUpdated;
  }
  
  selectLocation(event: google.maps.MapMouseEvent) {
    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();
  }

  filterHealthCenters(place){
    let healthCenterKeyWords = ["hospital","doctor"]
    this.filterPlace(place,healthCenterKeyWords,this.healthCenters);
  }

  filterRestaurants(place){
    let restaurantKeywords = ["restaurant","bar","cafe"];
    this.filterPlace(place,restaurantKeywords,this.restaurants);  
  }

  filterSupermarkets(place){
    let supermarketKeywords = ["supermarket"];
    this.filterPlace(place,supermarketKeywords,this.superMarkets);  
  }

  filterAtms(place){
    let atmKeywords = ["atm","finance","bank"];
    this.filterPlace(place,atmKeywords,this.atms);  
  }

  filterPlaces(place){
    this.filterHealthCenters(place);
    this.filterRestaurants(place);
    this.filterSupermarkets(place);
    this.filterAtms(place);
  }

  showRestaurants(){
    this.selectedShowRestaurants=true;
    this.showAll=false;
    this.selectedShowAtms=false;
    this.selectedShowHealthCenters=false;
    this.selectedShowSuperMarkets=false;
  }

  showAtms(){
    this.atms.forEach(element => {
      console.log(element);
    });
  }

  showSupermarkets(){
    this.superMarkets.forEach(element => {
      console.log(element);
    });
  }

  showHealthCenters(){
    this.healthCenters.forEach(element => {
      console.log(element);
    });
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
        let place = new NearByPlace(element.latitude,element.longitude
          ,element.name,element.rating,element.types,element.vicinity);
          if(this.checkLocationDistance(place.latitude,place.longitude)) {
            this.nearByPlaces.push(place);          
            this.filterPlaces(place);
          }
          
      },  this.spinnerService.requestEnded(),
      console.log(this.healthCenters)

      );
    }, (error) => {
      console.error(error);
    });
  }

  clearMap(){
    this.spinnerService.requestStarted();;
    this.nearByPlaces = [];
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

  checkInputs(){
    return this.latitude == 0 && this.longitude == 0 || this.radius==0;
  }

  checkLocationDistance(latitude,longitude){
    return this.calculateDistance(this.latitude,this.longitude,latitude,longitude) < this.radius;
  }

}
