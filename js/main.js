//declare map variable globally so all functions have access
var map;
var minValue;

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
		 center: [38, -95],
		 zoom: 5
    });

    //add OSM base tilelayer
    L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
		 maxZoom: 20,
		 attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each state
    for(var state of data.features){
        //loop through each year
        for(var year = 2007; year <= 2015; year+=1){
              //get mine for current year
              var value = state.properties["Mine_" + String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 3;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
	 //Determine which attribute to visualize with proportional symbols
	 var attribute = attributes[0];
	 
	 //check
	 console.log(attribute);
	 
	 //create marker options
	 var options = {
		 fillColor: "#ff7800",
		 color: "#000",
		 weight: 1,
		 opacity: 1,
		 fillOpacity: 0.8
	 };
	 //For each feature, determine its value for the selected attribute
	 var attValue = Number(feature.properties[attribute]);
	 
	 //Give each feature's circle marker a radius based on its attribute value
	 options.radius = calcPropRadius(attValue);
	 
	 //create circle marker layer
	 var layer = L.circleMarker(latlng, options);
	 
	 //Example 3.18 line 4
	 
	//build popup content string starting with city...Example 2.1 line 24
	var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";
		 
	//add formatted attribute to popup content string
	var mines = attribute.split("_")[1];
	popupContent += "<p><b>Number of mines in " + mines + ":</b> " + feature.properties[attribute] + " </p>";
	
	 //bind the popup to the circle marker
	 layer.bindPopup(popupContent, {
		offset: new L.Point(0,-options.radius) 
	 });
	 
	 //return the circle marker to the L.geoJson pointToLayer option
	 return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
	 //create a Leaflet GeoJSON layer and add it to the map
	 L.geoJson(data, {
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	 }).addTo(map);
};

function createSequenceControls(attributes){
	 //create range input element (slider)
	 var slider = "<input class='range-slider' type='range'></input>";
	 document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
	 
	 //set slider attributes
	 document.querySelector(".range-slider").max = 8;
	 document.querySelector(".range-slider").min = 0;
	 document.querySelector(".range-slider").value = 0;
	 document.querySelector(".range-slider").step = 1;
	 
	 document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
	 document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
	 
	 //replace button content with images
	 document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
	 document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
	 
	 document.querySelectorAll('.step').forEach(function(step){
		 step.addEventListener("click", function(){
			//sequence
			var index = document.querySelector('.range-slider').value;
			
			if (step.id == 'forward'){
				 index++;
				 //Step 7: if past the last attribute, wrap around to first attribute
				 index = index > 8 ? 0 : index;
			} else if (step.id == 'reverse'){
				 index--;
				 //Step 7: if past the first attribute, wrap around to last attribute
				 index = index < 0 ? 8 : index;
				 };
			 //Step 8: update slider
			 document.querySelector('.range-slider').value = index
			 updatePropSymbols(attributes[index]);
			 //console.log(attributes[index]);
		 })
	 })
	 
	 document.querySelector('.range-slider').addEventListener('input', function(){
		//sequence
		var index = this.value;
		//console.log(index)
		updatePropSymbols(attributes[index]);
	 });
};

function processData(data){
	 //empty array to hold attributes
	 var attributes = [];
	 
	 //properties of the first feature in the dataset
	 var properties = data.features[0].properties;
	 
	 //push each attribute name into attributes array
	 for (var attribute in properties){
		//only take attributes with mine values
		if (attribute.indexOf("Mine") > -1){
			attributes.push(attribute);
		};
	 };
	 
	 //check result
	 //console.log(attributes);
	 
	 return attributes;
};

function updatePropSymbols(attribute){
	 map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//update the layer style and popup
			//access feature properties
			 var props = layer.feature.properties;
			 //update each feature's radius based on new attribute values
			 var radius = calcPropRadius(props[attribute]);
			 layer.setRadius(radius);
		 
		 
			 //build popup content string starting with city...Example 2.1 line 24
			 var popupContent = "<p><b>State:</b> " + props.State + "</p>";
			 
			 //add formatted attribute to popup content string
			 var mines = attribute.split("_")[1];
			 popupContent += "<p><b>Number of mines in " + mines + ":</b> " + props[attribute] + " </p>";
		
			//update popup content 
			 popup = layer.getPopup(); 
			 popup.setContent(popupContent).update();
		};
	 });
};

//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/NumMines.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
			//create an attributes array
			var attributes = processData(json);
			
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
			createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)