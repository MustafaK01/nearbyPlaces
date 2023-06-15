import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nearbyPlaces';
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  latitude = 0;
  longitude = 0;
  radius=0;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];

  addMarker(event: google.maps.MapMouseEvent) {
    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();
    this.markerPositions.pop();
    this.markerPositions.push(event.latLng.toJSON());
  }

}
