import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NearByPlace } from './model/NearbyPlace.model';
import { MapOptions } from './model/Options.model';

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
  center: google.maps.LatLngLiteral = { lat: 49, lng: 12 };
  mapOptions: MapOptions;

  constructor(private http: HttpClient) {
    this.mapOptions = new MapOptions();
   }

  ngOnInit(): void {  }

  updateRadius() {
    this.mapOptions.circleOptions.radius = Number(this.radius);
    this.circleUpdated = !this.circleUpdated;
  }
  
  selectLocation(event: google.maps.MapMouseEvent) {
    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();
  }

  searchByLatLngAndRadius(){
    this.http.get('http://localhost:8070/api/location-service/getNearbyPlaces?latitude='+this.latitude
    +'&longitude='+this.longitude+'&radius='+this.radius).subscribe((response:any) => {
      console.log(response.nearbyPlaces);
      response.nearbyPlaces.forEach(element => {
        let place = new NearByPlace(element.latitude,element.longitude
          ,element.name,element.rating,element.types,element.vicinity);
          this.nearByPlaces.push(place);
      });
    }, (error) => {
      console.error(error);
    });

  }


}
