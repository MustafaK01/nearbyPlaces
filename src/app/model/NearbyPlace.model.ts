export class NearByPlace{

    latitude:number;
    longitude:number;
    name:string;
    rating:number;
    types:string[]
    vicinity:string;
    selected: boolean;
    distance:number;
    constructor(latitude,longitude,name,rating,types,vicinity,distance){
        this.latitude=latitude;
        this.longitude = longitude;
        this.name=name;
        this.rating = rating;
        this.types = types;
        this.vicinity = vicinity;
        this.selected = false;
        this.distance = distance;
    }


}