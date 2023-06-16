export class MarkerOptions {
    draggable: boolean;
    icon: { url: string };
}
  
export class CircleOptions {
    strokeColor: string;
    fillColor: string;
    radius: number;
}
  
export class MapOptions {
    // radius: number = 1500;
    selectedLocationMarkerOptions: MarkerOptions = {
        draggable: false,
        icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    };

    nearbyPlacesMarkerOptions: MarkerOptions = {
        draggable: false,
        icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    };

    // circleOptions: CircleOptions = {
    //     strokeColor: 'blue',
    //     fillColor: 'gray',
    //     radius: this.radius
    // };


}
