/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
	 //create the map
	 map = L.map('map', {
		 center: [20, 0],
		 zoom: 2
	});
	 //add OSM base tilelayer
	 L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
		 maxZoom: 20,
		 attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
	 }).addTo(map);
	 //call getData function
	 getData(map);
};

function onEachFeature(feature, layer) {
	 //no property named popupContent; instead, create html string with all properties
	 var popupContent = "";
	 if (feature.properties) {
		//loop to add feature property names and values to html string
		for (var property in feature.properties){
			popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
		}
		layer.bindPopup(popupContent);
	 };
};

//function to retrieve the data and place it on the map
function getData(map){
	 //load the data
	 fetch("data/NumMines.geojson")
		.then(function(response){
			return response.json();
		})
		.then(function(json){
			//create a Leaflet GeoJSON layer and add it to the map
			L.geoJson(json, {
				onEachFeature: onEachFeature
			}).addTo(map);
		}) 
};

document.addEventListener('DOMContentLoaded',createMap);