//Creates a map with a centre of 51.505, -0.09 and a zoom level of 13
var map = L.map('map').setView([51.505, -0.09], 13);
//Loads a tile layer for the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//Displays clickable icons on map
var marker = L.marker([51.5, -0.09]).addTo(map);
//Creates a circle with centre of 51.508, -0.11 and radius of 500
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);
//Creates a polygon with boundaries of [51.509, -0.08], [51.503, -0.06], and [51.51, -0.047]
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);
//Binds popup to the related feature
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");
//Standalone popup
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);


//When map is clicked, displays popup
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
map.on('click', onMapClick);