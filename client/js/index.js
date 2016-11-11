var shipLayer = L.layerGroup();
var ships = L.icon({
    iconUrl: 'http://deepspaceindustries.com/wp-content/uploads/2015/08/DSI-Firefly_Shorter-Tenna-500.png',
    iconSize: [80, 60]
});
var map = L.map('map', { zoomControl:false }), 
    realtime = L.realtime({
        url: 'http://satellite.mediagis.com/?s=39404',
        crossOrigin: true,
        type: 'json'
    }, {
        interval: 3 * 1000,
        getFeatureId: function(featureData){
    	return featureData.properties.mmsi;
       },
    pointToLayer: function (feature, latlng) {
      marker = L.marker(latlng, {icon: ships});
      marker.bindPopup('mmsi: ' + feature.properties.mmsi +
                       '<br/> course:' + feature.properties.hdg+
                       '<br/> speed:' + feature.properties.sog);
      marker.addTo(shipLayer);
      return marker;
    }
    


    }).addTo(map);


//base map layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

realtime.on('update', function() {
    map.fitBounds(realtime.getBounds(), {maxZoom: 3});
});

//nighttime layer

var t = L.terminator();
t.addTo(map);
setInterval(function(){updateTerminator(t)}, 500);
function updateTerminator(t) {
  var t2 = L.terminator();
  t.setLatLngs(t2.getLatLngs());
  t.redraw();
}

//orbit layer
$.getJSON("http://satellite.mediagis.com/orbit/?s=39404", function(data) 
	{ addDataToMap(data, map); });
function addDataToMap(data, map) {
    var dataLayer = L.geoJson(data);
    dataLayer.addTo(map);
}

loadSatdata = function(){
	$.ajax({
	    url: "http://satellite.mediagis.com/?s=39404", 
	    dataType: 'json',
	    type: 'get',
	    cache: false,
	    success: function(data) { 
	        $(data.features).each(function(index, value) { 
                
				//Cubesat Telemetry in App
                $satContainer = $(".satinfo");
                satView = function(){
                    $satContainer.find("td.lat").text("LNG: " + value.geometry.coordinates["0"].toFixed(2) + "\u00B0");
                    $satContainer.find("td.lng").text("LAT: " + value.geometry.coordinates["1"].toFixed(2)+ "\u00B0");
                    $satContainer.find("td.altitude").text("ALT: " + value.properties.altitude.toFixed(2) + " km");
                    $satContainer.find("td.speed").text("SPD: " + value.properties.speed.toFixed(2) + " km/s" );
                    $satContainer.fadeIn('slow');
                };
                $satContainer.fadeOut("slow", null, satView); 

                //Write Cubesat Telemetry to page
                  
	    	});
	    }
	});
};
loadSatdata();
setInterval(loadSatdata,4000);
