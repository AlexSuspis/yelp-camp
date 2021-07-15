mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campgroundCoordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

var marker = new mapboxgl.Marker()
    .setLngLat(campgroundCoordinates)
    .addTo(map);

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');